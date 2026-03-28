
const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const DB_PATH = path.join(__dirname, "data", "clientes.json");

function loadDB(){
  if(!fs.existsSync(DB_PATH)){
    const seed = {
      clientes: [
        {
          id: Date.now(),
          empresa: "EMPRESA_TESTE",
          plano: "profissional",
          valor: 99,
          vencimento: new Date(Date.now()+7*86400000).toISOString(),
          status: "ativo",
          modulos: ["estoque","dashboard","picking","wms"]
        }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw || "{}");
  } catch(e){
    return { clientes: [] };
  }
}

function saveDB(db){
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function computeStatus(c){
  const now = Date.now();
  const venc = new Date(c.vencimento).getTime();
  if (c.status === "bloqueado") return "bloqueado";
  if (now > venc) return "atrasado";
  return "ativo";
}

function summary(db){
  const totalClientes = db.clientes.length;
  let receita = 0;
  let atrasados = 0;
  db.clientes.forEach(c => {
    const st = computeStatus(c);
    if(st === "ativo") receita += Number(c.valor || 0);
    if(st === "atrasado") atrasados++;
  });
  return { totalClientes, receita, atrasados };
}

// ===== API =====

// listar clientes
app.get("/api/clientes", (req,res)=>{
  const db = loadDB();
  const list = db.clientes.map(c => ({ ...c, statusCalc: computeStatus(c) }));
  res.json({ ok:true, clientes: list });
});

// resumo
app.get("/api/resumo", (req,res)=>{
  const db = loadDB();
  res.json({ ok:true, ...summary(db) });
});

// criar cliente
app.post("/api/clientes", (req,res)=>{
  const db = loadDB();
  const { empresa, plano, valor, vencimento, modulos } = req.body || {};
  if(!empresa) return res.status(400).json({ ok:false, erro:"empresa obrigatória" });

  const novo = {
    id: Date.now(),
    empresa: String(empresa).trim().toUpperCase(),
    plano: plano || "basico",
    valor: Number(valor || 0),
    vencimento: vencimento || new Date(Date.now()+30*86400000).toISOString(),
    status: "ativo",
    modulos: Array.isArray(modulos) ? modulos : ["estoque","dashboard"]
  };
  db.clientes.push(novo);
  saveDB(db);
  res.json({ ok:true, cliente: novo });
});

// atualizar cliente
app.put("/api/clientes/:id", (req,res)=>{
  const db = loadDB();
  const id = Number(req.params.id);
  const idx = db.clientes.findIndex(c => c.id === id);
  if(idx === -1) return res.status(404).json({ ok:false, erro:"não encontrado" });

  const cur = db.clientes[idx];
  const { empresa, plano, valor, vencimento, status, modulos } = req.body || {};
  if(empresa !== undefined) cur.empresa = String(empresa).trim().toUpperCase();
  if(plano !== undefined) cur.plano = plano;
  if(valor !== undefined) cur.valor = Number(valor);
  if(vencimento !== undefined) cur.vencimento = vencimento;
  if(status !== undefined) cur.status = status; // ativo | bloqueado
  if(modulos !== undefined) cur.modulos = modulos;

  db.clientes[idx] = cur;
  saveDB(db);
  res.json({ ok:true, cliente: cur });
});

// excluir
app.delete("/api/clientes/:id", (req,res)=>{
  const db = loadDB();
  const id = Number(req.params.id);
  const next = db.clientes.filter(c => c.id !== id);
  db.clientes = next;
  saveDB(db);
  res.json({ ok:true });
});

// registrar pagamento (renova vencimento)
app.post("/api/pagamento", (req,res)=>{
  const db = loadDB();
  const { id, dias = 30 } = req.body || {};
  const idx = db.clientes.findIndex(c => c.id === Number(id));
  if(idx === -1) return res.status(404).json({ ok:false, erro:"não encontrado" });

  const cur = db.clientes[idx];
  cur.vencimento = new Date(Date.now() + Number(dias)*86400000).toISOString();
  cur.status = "ativo";
  db.clientes[idx] = cur;
  saveDB(db);
  res.json({ ok:true, cliente: cur });
});

// bloquear automaticamente atrasados (pode ser chamado manualmente ou via cron)
app.post("/api/rotina/bloquear-atrasados", (req,res)=>{
  const db = loadDB();
  let count = 0;
  db.clientes.forEach(c => {
    if(computeStatus(c) === "atrasado"){
      c.status = "bloqueado";
      count++;
    }
  });
  saveDB(db);
  res.json({ ok:true, bloqueados: count });
});

app.listen(PORT, ()=> console.log("PAINEL ADMIN rodando na porta "+PORT));
