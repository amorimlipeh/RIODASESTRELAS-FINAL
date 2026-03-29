require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const XLSX = require("xlsx");

const { readDb, writeDb, appendLog } = require("./server/lib/db");
const { requireAuth } = require("./server/services/authService");

const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", require("./server/routes/auth"));
app.use("/api/clientes", require("./server/routes/clientes"));
app.use("/api/permissoes", require("./server/routes/permissoes"));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/app", (req, res) => res.sendFile(path.join(__dirname, "public", "app.html")));

function normalizarEndereco(endereco) {
  if (!endereco) return null;
  const limpo = String(endereco).replace(/\D/g, "");
  if (limpo.length !== 7) return null;
  return `${limpo.slice(0,2)}-${limpo.slice(2,5)}-${limpo.slice(5,6)}-${limpo.slice(6,7)}`;
}

function isBuraco(pos) {
  const p = Number(pos);
  return (p >= 49 && p <= 54) || (p >= 95 && p <= 100);
}

app.get("/api/status", requireAuth, (req, res) => {
  const db = readDb();
  res.json({
    ok: true,
    usuario: req.user,
    kpis: {
      produtos: db.produtos.length,
      estoque: db.estoque.length,
      pedidos: db.pedidos.length
    }
  });
});

app.get("/api/produtos", requireAuth, (req, res) => {
  const db = readDb();
  res.json({ ok: true, produtos: db.produtos });
});

app.post("/api/produtos", requireAuth, (req, res) => {
  const db = readDb();
  const codigo = String(req.body?.codigo || "").trim().toUpperCase();
  if (!codigo) return res.status(400).json({ ok: false, erro: "Código obrigatório" });

  let produto = db.produtos.find(p => p.codigo === codigo);
  const lastro = Number(req.body?.lastro || 0);
  const camada = Number(req.body?.camada || 0);

  const payload = {
    codigo,
    descricao: String(req.body?.descricao || "").trim(),
    fator: Number(req.body?.fator || 0),
    lastro,
    camada,
    caixas_por_pallet: lastro * camada,
    imagem: String(req.body?.imagem || "").trim()
  };

  if (produto) Object.assign(produto, payload);
  else db.produtos.push(payload);

  writeDb(db);
  appendLog("produto_salvo", { codigo });
  res.json({ ok: true, produto: payload });
});

app.delete("/api/produtos/:codigo", requireAuth, (req, res) => {
  const db = readDb();
  const codigo = String(req.params.codigo || "").trim().toUpperCase();
  db.produtos = db.produtos.filter(p => p.codigo !== codigo);
  writeDb(db);
  appendLog("produto_removido", { codigo });
  res.json({ ok: true });
});

app.get("/api/estoque", requireAuth, (req, res) => {
  const db = readDb();
  res.json({ ok: true, estoque: db.estoque });
});

app.post("/api/estoque/entrada", requireAuth, (req, res) => {
  const db = readDb();
  const codigo = String(req.body?.codigo || "").trim().toUpperCase();
  const endereco = normalizarEndereco(req.body?.endereco);
  const quantidade = Number(req.body?.quantidade || 0);
  if (!codigo || !endereco || !quantidade) {
    return res.status(400).json({ ok: false, erro: "Código, endereço e quantidade são obrigatórios" });
  }

  let item = db.estoque.find(i => i.codigo === codigo && i.endereco === endereco);
  if (!item) {
    item = { codigo, endereco, quantidade: 0, reservado: 0 };
    db.estoque.push(item);
  }
  item.quantidade += quantidade;

  writeDb(db);
  appendLog("estoque_entrada", { codigo, endereco, quantidade });
  res.json({ ok: true, item });
});

app.post("/api/importar", requireAuth, upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, erro: "Arquivo não enviado" });
    const db = readDb();
    const wb = XLSX.readFile(req.file.path);
    const nomeAba = wb.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[nomeAba], { defval: "" });

    let importados = 0;
    rows.forEach((row) => {
      const codigo = String(
        row.codigo || row.Codigo || row["Código"] || row["Código do Produto"] || row["ITEM NO"] || ""
      ).trim().toUpperCase();

      const quantidade = Number(row.quantidade || row.Quantidade || row["Estoque (UN)"] || row.qtd || 0);
      const endereco = normalizarEndereco(row.endereco || row.Endereco || row["Endereço"] || row["Endereco"] || "0400111");

      if (!codigo || !endereco) return;

      let item = db.estoque.find(i => i.codigo === codigo && i.endereco === endereco);
      if (!item) {
        item = { codigo, endereco, quantidade: 0, reservado: 0 };
        db.estoque.push(item);
      }
      item.quantidade += quantidade;
      importados += 1;
    });

    writeDb(db);
    appendLog("importacao_xlsx", { aba: nomeAba, importados, linhas: rows.length });
    res.json({ ok: true, aba: nomeAba, totalLinhas: rows.length, importados, preview: rows.slice(0, 10) });
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
});

app.get("/api/wms/grid", requireAuth, (req, res) => {
  const db = readDb();
  const grid = {};
  for (let r = 1; r <= 7; r++) {
    const rua = String(r).padStart(2, "0");
    grid[rua] = {};
    for (let a = 1; a <= 7; a++) {
      grid[rua][a] = {};
      for (let p = 1; p <= 140; p++) {
        const pos = String(p).padStart(3, "0");
        const endereco = `${rua}-${pos}-${a}-1`;

        let status = "vazio";
        let produto = "";
        let quantidade = 0;

        if (["01", "02", "03"].includes(rua)) {
          status = "bloqueado";
        } else if (isBuraco(p) && a <= 3) {
          status = "buraco";
        } else {
          const item = db.estoque.find(e => e.endereco === endereco);
          if (item) {
            status = Number(item.reservado || 0) > 0 ? "reservado" : "ocupado";
            produto = item.codigo;
            quantidade = item.quantidade;
          }
        }

        grid[rua][a][pos] = { status, produto, quantidade };
      }
    }
  }
  res.json({ ok: true, grid });
});

app.get("/api/pedidos", requireAuth, (req, res) => {
  const db = readDb();
  res.json({ ok: true, pedidos: db.pedidos });
});

app.post("/api/pedidos", requireAuth, (req, res) => {
  const db = readDb();
  const pedido = {
    id: Date.now(),
    status: "pendente",
    itens: Array.isArray(req.body?.itens) ? req.body.itens.map(i => ({
      codigo: String(i.codigo || "").trim().toUpperCase(),
      quantidade: Number(i.quantidade || 0),
      falta: 0
    })) : []
  };
  db.pedidos.push(pedido);
  writeDb(db);
  appendLog("pedido_criado", { id: pedido.id, itens: pedido.itens.length });
  res.json({ ok: true, pedido });
});

app.post("/api/pedidos/picking/:id", requireAuth, (req, res) => {
  const db = readDb();
  const pedido = db.pedidos.find(p => String(p.id) === String(req.params.id));
  if (!pedido) return res.status(404).json({ ok: false, erro: "Pedido não encontrado" });

  pedido.itens.forEach(itemPedido => {
    let restante = Number(itemPedido.quantidade || 0);
    db.estoque.forEach(itemEstoque => {
      const disponivel = Number(itemEstoque.quantidade || 0) - Number(itemEstoque.reservado || 0);
      if (itemEstoque.codigo === itemPedido.codigo && restante > 0 && disponivel > 0) {
        const usar = Math.min(disponivel, restante);
        itemEstoque.reservado += usar;
        restante -= usar;
      }
    });
    itemPedido.falta = restante;
  });

  pedido.status = "separacao";
  writeDb(db);
  appendLog("picking_gerado", { pedido: pedido.id });
  res.json({ ok: true, pedido });
});

app.get("/api/logs", requireAuth, (req, res) => {
  const db = readDb();
  res.json({ ok: true, logs: db.logs.slice(0, 100) });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("RIO consolidado rodando na porta " + PORT);
});
