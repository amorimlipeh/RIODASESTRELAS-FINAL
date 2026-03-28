
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function migrarArquivoLegado(filePath){
  const full = path.resolve(filePath);
  const raw = fs.readFileSync(full, "utf-8");
  const data = JSON.parse(raw);

  const empresaMap = {};
  const clienteMap = {};

  await pool.query("BEGIN");

  try{
    for(const emp of (data.empresas || [])){
      const r = await pool.query(
        "INSERT INTO empresas (nome, plano, ativa) VALUES ($1,$2,$3) ON CONFLICT (nome) DO UPDATE SET plano=EXCLUDED.plano, ativa=EXCLUDED.ativa RETURNING id, nome",
        [emp.nome, emp.plano || "profissional", emp.ativa !== false]
      );
      empresaMap[r.rows[0].nome] = r.rows[0].id;
    }

    for(const u of (data.usuarios || [])){
      const empresaId = empresaMap[u.empresa];
      if(!empresaId) continue;
      await pool.query(
        "INSERT INTO usuarios (empresa_id, email, senha, tipo) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING",
        [empresaId, u.email, u.senha, u.tipo || "admin"]
      );
    }

    for(const c of (data.clientes || [])){
      const empresaId = empresaMap[c.empresa];
      if(!empresaId) continue;
      const r = await pool.query(
        "INSERT INTO clientes (empresa_id, nome, plano, ativo) VALUES ($1,$2,$3,$4) RETURNING id, nome",
        [empresaId, c.nome, c.plano || "profissional", c.ativo !== false]
      );
      clienteMap[r.rows[0].nome] = r.rows[0].id;
    }

    for(const p of (data.pagamentos || [])){
      const clienteId = clienteMap[p.cliente];
      if(!clienteId) continue;
      await pool.query(
        "INSERT INTO pagamentos (cliente_id, valor, data) VALUES ($1,$2,$3)",
        [clienteId, Number(p.valor || 0), p.data || new Date().toISOString()]
      );
    }

    await pool.query("COMMIT");
    return { ok:true, empresas:Object.keys(empresaMap).length, clientes:Object.keys(clienteMap).length };
  }catch(e){
    await pool.query("ROLLBACK");
    throw e;
  }
}

module.exports = { migrarArquivoLegado };
