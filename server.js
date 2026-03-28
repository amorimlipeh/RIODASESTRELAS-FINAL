
const express = require("express");
const path = require("path");
const multer = require("multer");
const XLSX = require("xlsx");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({ dest: path.join(__dirname, "uploads") });

// ===================== BASE CONSOLIDADA V3 =====================
const planos = {
  teste: { nome: "Teste", dias: 15, funcoes: ["estoque", "wms", "picking", "dashboard", "importador", "ia", "tempo_real"] },
  profissional: { nome: "Profissional", dias: 0, funcoes: ["estoque", "wms", "picking", "dashboard", "importador", "ia", "tempo_real"] },
  enterprise: { nome: "Enterprise", dias: 0, funcoes: ["*"] }
};

let empresas = {
  "EMPRESA_TESTE": {
    nome: "EMPRESA_TESTE",
    plano: "teste",
    trialAtivo: true,
    trialDias: 15,
    ativa: true,
    status: "liberada",
    funcoesLiberadas: [...planos.teste.funcoes]
  }
};

let usuarios = [
  {
    user: "desenvolvedor",
    senha: "123",
    empresa: "MASTER",
    tipo: "desenvolvedor",
    permissoes: ["*"]
  },
  {
    user: "admin_teste",
    senha: "123",
    empresa: "EMPRESA_TESTE",
    tipo: "admin",
    permissoes: ["estoque", "wms", "picking", "dashboard", "importador", "ia", "tempo_real"]
  }
];

let estoque = {
  EMPRESA_TESTE: [
    { codigo: "A123", quantidade: 50, reservado: 0, endereco: "01-001-1-1" },
    { codigo: "B456", quantidade: 3, reservado: 0, endereco: "01-010-1-1" },
    { codigo: "C789", quantidade: 100, reservado: 0, endereco: "02-005-1-1" }
  ]
};

let pedidos = {
  EMPRESA_TESTE: []
};

let notificacoes = [];
let logs = [];
let sseClients = [];

function getEmpresaKey(req) {
  const emp = String(req.headers["x-empresa"] || req.query.empresa || "EMPRESA_TESTE")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
  return emp;
}

function addLog(msg) {
  logs.unshift({ msg, time: new Date().toISOString() });
  if (logs.length > 200) logs = logs.slice(0, 200);
}

function addNotification(msg) {
  notificacoes.unshift({ msg, time: new Date().toISOString() });
  if (notificacoes.length > 100) notificacoes = notificacoes.slice(0, 100);
  broadcast({ tipo: "notificacao", msg });
}

function broadcast(payload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((res) => res.write(data));
}

function normalizarEndereco(endereco) {
  if (!endereco) return null;
  const limpo = String(endereco).replace(/\D/g, "");
  if (limpo.length !== 7) return null;
  return `${limpo.slice(0,2)}-${limpo.slice(2,5)}-${limpo.slice(5,6)}-${limpo.slice(6,7)}`;
}

function ensureEmpresaData(empresa) {
  if (!estoque[empresa]) estoque[empresa] = [];
  if (!pedidos[empresa]) pedidos[empresa] = [];
}

function findProduto(empresa, codigo) {
  ensureEmpresaData(empresa);
  return estoque[empresa].filter(i => i.codigo === codigo);
}

function buildDashboard(empresa) {
  ensureEmpresaData(empresa);
  const itens = estoque[empresa];
  const totalProdutos = itens.length;
  const totalQuantidade = itens.reduce((sum, i) => sum + Number(i.quantidade || 0), 0);
  const totalReservado = itens.reduce((sum, i) => sum + Number(i.reservado || 0), 0);
  const alertasBaixos = itens.filter(i => Number(i.quantidade || 0) <= 5).length;
  return { totalProdutos, totalQuantidade, totalReservado, alertasBaixos };
}

function sugerirEndereco(empresa) {
  ensureEmpresaData(empresa);
  const ocupados = new Set(estoque[empresa].map(i => i.endereco));
  for (let r = 1; r <= 7; r++) {
    for (let p = 1; p <= 140; p++) {
      for (let a = 1; a <= 7; a++) {
        const end = `${String(r).padStart(2,"0")}-${String(p).padStart(3,"0")}-${a}-1`;
        if (!ocupados.has(end)) return end;
      }
    }
  }
  return null;
}

function buildWmsGrid(empresa) {
  ensureEmpresaData(empresa);
  const grid = {};
  for (let r = 1; r <= 3; r++) {
    const rua = String(r).padStart(2, "0");
    grid[rua] = {};
    for (let a = 1; a <= 2; a++) {
      grid[rua][a] = {};
      for (let p = 1; p <= 20; p++) {
        const pos = String(p).padStart(3, "0");
        const endereco = `${rua}-${pos}-${a}-1`;
        const item = estoque[empresa].find(e => e.endereco === endereco);
        let status = "vazio";
        if (item) status = Number(item.reservado || 0) > 0 ? "reservado" : "ocupado";
        grid[rua][a][pos] = {
          status,
          produto: item?.codigo || "",
          quantidade: item?.quantidade || 0
        };
      }
    }
  }
  return grid;
}

// ===================== SSE =====================
app.get("/api/stream", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });
  res.flushHeaders();
  sseClients.push(res);
  req.on("close", () => {
    sseClients = sseClients.filter(c => c !== res);
  });
});

// ===================== STATUS =====================
app.get("/api/status", (req, res) => {
  res.json({ ok: true, sistema: "RIO BASE CONSOLIDADA V3", status: "online" });
});

// ===================== AUTH / SAAS =====================
app.post("/api/login", (req, res) => {
  const { user, senha } = req.body || {};
  const usuario = usuarios.find(u => u.user === user && u.senha === senha);
  if (!usuario) return res.status(401).json({ ok: false, erro: "Login inválido" });
  res.json({ ok: true, usuario });
});

app.get("/api/dev/painel", (req, res) => {
  const user = String(req.headers["x-user"] || "");
  const usuario = usuarios.find(u => u.user === user);
  if (!usuario || usuario.tipo !== "desenvolvedor") {
    return res.status(403).json({ ok: false, erro: "Acesso negado" });
  }
  res.json({ ok: true, empresas, usuarios, planos });
});

app.post("/api/dev/liberar-teste", (req, res) => {
  const { empresa, dias = 15 } = req.body || {};
  const emp = String(empresa || "").trim().toUpperCase().replace(/\s+/g, "_");
  if (!emp) return res.status(400).json({ ok: false, erro: "Empresa obrigatória" });
  if (!empresas[emp]) {
    empresas[emp] = {
      nome: emp,
      plano: "teste",
      trialAtivo: true,
      trialDias: Number(dias),
      ativa: true,
      status: "liberada",
      funcoesLiberadas: [...planos.teste.funcoes]
    };
    ensureEmpresaData(emp);
  } else {
    empresas[emp].trialAtivo = true;
    empresas[emp].trialDias = Number(dias);
    empresas[emp].ativa = true;
    empresas[emp].status = "liberada";
  }
  addLog(`Trial liberado para ${emp}`);
  res.json({ ok: true, empresa: empresas[emp] });
});

// ===================== ESTOQUE =====================
app.post("/api/estoque", (req, res) => {
  const empresa = getEmpresaKey(req);
  ensureEmpresaData(empresa);

  const { codigo, qtd, endereco } = req.body || {};
  if (!codigo) return res.status(400).json({ ok: false, erro: "Código obrigatório" });

  const quantidade = Number(qtd || 0);
  const enderecoFinal = normalizarEndereco(endereco) || sugerirEndereco(empresa);
  if (!enderecoFinal) return res.status(400).json({ ok: false, erro: "Sem endereço disponível" });

  let item = estoque[empresa].find(i => i.codigo === codigo && i.endereco === enderecoFinal);
  if (!item) {
    item = { codigo: String(codigo), quantidade: 0, reservado: 0, endereco: enderecoFinal };
    estoque[empresa].push(item);
  }
  item.quantidade += quantidade;

  addLog(`Entrada ${codigo} ${quantidade} em ${empresa}`);
  if (item.quantidade <= 5) addNotification(`⚠️ Estoque baixo: ${codigo}`);
  broadcast({ tipo: "estoque", empresa, codigo, qtd: quantidade, endereco: enderecoFinal });

  res.json({ ok: true, item, enderecoSugerido: enderecoFinal });
});

app.get("/api/estoque", (req, res) => {
  const empresa = getEmpresaKey(req);
  ensureEmpresaData(empresa);
  res.json({ ok: true, estoque: estoque[empresa] });
});

// ===================== IMPORTADOR =====================
app.post("/api/importar", upload.single("file"), (req, res) => {
  try {
    const empresa = getEmpresaKey(req);
    ensureEmpresaData(empresa);
    if (!req.file) return res.status(400).json({ ok: false, erro: "Arquivo não enviado" });

    const wb = XLSX.readFile(req.file.path);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const preview = data.slice(0, 20);

    res.json({ ok: true, total: data.length, preview });
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
});

app.post("/api/importar-aplicar", upload.single("file"), (req, res) => {
  try {
    const empresa = getEmpresaKey(req);
    ensureEmpresaData(empresa);
    if (!req.file) return res.status(400).json({ ok: false, erro: "Arquivo não enviado" });

    const wb = XLSX.readFile(req.file.path);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let aplicados = 0;
    data.forEach(row => {
      const codigo = String(row.codigo || row.Codigo || row["Código"] || row["Código do Produto"] || "").trim();
      const qtd = Number(row.qtd || row.quantidade || row.Quantidade || row["Estoque (UN)"] || 0);
      if (!codigo) return;
      const endereco = sugerirEndereco(empresa);
      if (!endereco) return;
      estoque[empresa].push({ codigo, quantidade: qtd, reservado: 0, endereco });
      aplicados++;
    });

    addLog(`Importação aplicada em ${empresa}: ${aplicados} itens`);
    res.json({ ok: true, total: data.length, aplicados });
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
});

// ===================== WMS / IA =====================
app.get("/api/wms", (req, res) => {
  const empresa = getEmpresaKey(req);
  res.json({ ok: true, grid: buildWmsGrid(empresa) });
});

app.get("/api/ia", (req, res) => {
  const empresa = getEmpresaKey(req);
  ensureEmpresaData(empresa);
  const alertas = [];
  const sugestoes = [];

  estoque[empresa].forEach(p => {
    if (Number(p.quantidade || 0) <= 5) alertas.push("Falta iminente: " + p.codigo);
    if (Number(p.quantidade || 0) > 80) sugestoes.push("Produto com alto volume: " + p.codigo + " → rua rápida");
  });

  res.json({ ok: true, alertas, sugestoes });
});

app.get("/api/wms/sugestao", (req, res) => {
  const empresa = getEmpresaKey(req);
  const endereco = sugerirEndereco(empresa);
  res.json({ ok: true, endereco });
});

// ===================== PICKING / ROTA / VOZ =====================
app.post("/api/pedido", (req, res) => {
  const empresa = getEmpresaKey(req);
  ensureEmpresaData(empresa);
  const pedido = {
    id: Date.now(),
    status: "pendente",
    itens: Array.isArray(req.body?.itens) ? req.body.itens : []
  };
  pedidos[empresa].push(pedido);
  addLog(`Pedido criado em ${empresa}: ${pedido.id}`);
  res.json({ ok: true, pedido });
});

app.get("/api/pedidos", (req, res) => {
  const empresa = getEmpresaKey(req);
  ensureEmpresaData(empresa);
  res.json({ ok: true, pedidos: pedidos[empresa] });
});

app.post("/api/picking/:id", (req, res) => {
  const empresa = getEmpresaKey(req);
  ensureEmpresaData(empresa);

  const pedido = pedidos[empresa].find(p => String(p.id) === String(req.params.id));
  if (!pedido) return res.status(404).json({ ok: false, erro: "Pedido não encontrado" });

  pedido.itens.forEach(it => {
    let restante = Number(it.quantidade || 0);
    estoque[empresa].forEach(e => {
      const disponivel = Number(e.quantidade || 0) - Number(e.reservado || 0);
      if (e.codigo === it.codigo && restante > 0 && disponivel > 0) {
        const usar = Math.min(disponivel, restante);
        e.reservado += usar;
        restante -= usar;
      }
    });
    it.falta = restante;
  });

  pedido.status = "separacao";
  addLog(`Picking iniciado: ${pedido.id}`);
  res.json({ ok: true, pedido });
});

app.post("/api/rota", (req, res) => {
  const empresa = getEmpresaKey(req);
  ensureEmpresaData(empresa);

  const itens = Array.isArray(req.body?.itens) ? req.body.itens : [];
  const lista = [];

  itens.forEach(cod => {
    const item = estoque[empresa].find(e => e.codigo === cod);
    if (item) lista.push(item);
  });

  function ordenar(end) {
    const [r,p] = end.split("-");
    return { r: parseInt(r, 10), p: parseInt(p, 10) };
  }

  lista.sort((a,b) => {
    const A = ordenar(a.endereco);
    const B = ordenar(b.endereco);
    if (A.r !== B.r) return A.r - B.r;
    return A.p - B.p;
  });

  res.json({ ok: true, rota: lista });
});

app.get("/api/picking-voz", (req, res) => {
  const empresa = getEmpresaKey(req);
  ensureEmpresaData(empresa);
  const rota = estoque[empresa].slice(0, 5).map(i => ({
    codigo: i.codigo,
    endereco: i.endereco,
    qtd: Math.min(2, Number(i.quantidade || 1))
  }));
  res.json({ ok: true, rota });
});

// ===================== DASHBOARD / LOGS / NOTIF =====================
app.get("/api/dashboard", (req, res) => {
  const empresa = getEmpresaKey(req);
  res.json({ ok: true, ...buildDashboard(empresa) });
});

app.get("/api/notificacoes", (req, res) => {
  res.json({ ok: true, notificacoes });
});

app.get("/api/logs", (req, res) => {
  res.json({ ok: true, logs });
});

app.listen(PORT, () => {
  console.log("RIO BASE CONSOLIDADA V3 rodando na porta " + PORT);
});
