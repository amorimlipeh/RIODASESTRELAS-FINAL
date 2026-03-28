
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let empresas = {
  "EMPRESA_TESTE": {
    nome: "EMPRESA_TESTE",
    plano: "teste",
    trialAtivo: true,
    trialDias: 15,
    status: "liberada",
    funcoesLiberadas: ["estoque", "wms", "picking", "dashboard", "importador"],
    usuarios: ["desenvolvedor", "admin_teste"]
  }
};

let usuarios = [
  {
    user: "desenvolvedor",
    senha: "123",
    empresa: "MASTER",
    tipo: "desenvolvedor",
    acessoTotal: true,
    podeGerenciarPlanos: true,
    podeGerenciarPermissoes: true,
    permissoes: ["*"]
  },
  {
    user: "admin_teste",
    senha: "123",
    empresa: "EMPRESA_TESTE",
    tipo: "admin",
    acessoTotal: false,
    podeGerenciarPlanos: false,
    podeGerenciarPermissoes: true,
    permissoes: ["estoque", "wms", "picking", "dashboard", "importador"]
  }
];

const planos = {
  teste: {
    nome: "Teste",
    dias: 15,
    funcoes: ["estoque", "wms", "picking", "dashboard", "importador"]
  },
  basico: {
    nome: "Básico",
    dias: 0,
    funcoes: ["estoque", "dashboard"]
  },
  profissional: {
    nome: "Profissional",
    dias: 0,
    funcoes: ["estoque", "wms", "dashboard", "importador", "picking"]
  },
  enterprise: {
    nome: "Enterprise",
    dias: 0,
    funcoes: ["*"]
  }
};

function buscarUsuario(user, senha) {
  return usuarios.find(u => u.user === user && u.senha === senha);
}

function usuarioEhDesenvolvedor(usuario) {
  return usuario && usuario.tipo === "desenvolvedor";
}

function carregarUsuarioHeader(req) {
  const user = req.headers["x-user"];
  if (!user) return null;
  return usuarios.find(u => u.user === user) || null;
}

app.post("/api/login", (req, res) => {
  const { user, senha } = req.body || {};
  const usuario = buscarUsuario(user, senha);

  if (!usuario) {
    return res.json({ ok: false, erro: "Usuário ou senha inválidos" });
  }

  return res.json({
    ok: true,
    usuario
  });
});

app.get("/api/planos", (req, res) => {
  return res.json({ ok: true, planos });
});

app.get("/api/dev/painel", (req, res) => {
  const usuario = carregarUsuarioHeader(req);

  if (!usuarioEhDesenvolvedor(usuario)) {
    return res.status(403).json({ ok: false, erro: "Acesso negado" });
  }

  return res.json({
    ok: true,
    empresas,
    usuarios,
    planos
  });
});

app.post("/api/dev/empresa", (req, res) => {
  const usuario = carregarUsuarioHeader(req);

  if (!usuarioEhDesenvolvedor(usuario)) {
    return res.status(403).json({ ok: false, erro: "Acesso negado" });
  }

  const { nome, plano = "teste", liberarTeste = true } = req.body || {};
  if (!nome) {
    return res.status(400).json({ ok: false, erro: "Nome da empresa obrigatório" });
  }

  const nomeNormalizado = String(nome).trim().toUpperCase().replace(/\s+/g, "_");
  if (empresas[nomeNormalizado]) {
    return res.status(400).json({ ok: false, erro: "Empresa já cadastrada" });
  }

  const dadosPlano = planos[plano] || planos.teste;

  empresas[nomeNormalizado] = {
    nome: nomeNormalizado,
    plano,
    trialAtivo: !!liberarTeste,
    trialDias: liberarTeste ? (dadosPlano.dias || 15) : 0,
    status: liberarTeste ? "liberada" : "aguardando",
    funcoesLiberadas: [...dadosPlano.funcoes],
    usuarios: []
  };

  return res.json({ ok: true, empresa: empresas[nomeNormalizado] });
});

app.post("/api/dev/usuario", (req, res) => {
  const usuario = carregarUsuarioHeader(req);

  if (!usuarioEhDesenvolvedor(usuario)) {
    return res.status(403).json({ ok: false, erro: "Acesso negado" });
  }

  const { user, senha, empresa, tipo = "operador", permissoes = [] } = req.body || {};

  if (!user || !senha || !empresa) {
    return res.status(400).json({ ok: false, erro: "Usuário, senha e empresa são obrigatórios" });
  }

  const empresaNome = String(empresa).trim().toUpperCase().replace(/\s+/g, "_");
  if (!empresas[empresaNome]) {
    return res.status(404).json({ ok: false, erro: "Empresa não encontrada" });
  }

  if (usuarios.find(u => u.user === user)) {
    return res.status(400).json({ ok: false, erro: "Usuário já existe" });
  }

  const novoUsuario = {
    user,
    senha,
    empresa: empresaNome,
    tipo,
    acessoTotal: false,
    podeGerenciarPlanos: false,
    podeGerenciarPermissoes: tipo === "admin",
    permissoes
  };

  usuarios.push(novoUsuario);
  empresas[empresaNome].usuarios.push(user);

  return res.json({ ok: true, usuario: novoUsuario });
});

app.post("/api/dev/liberar-teste", (req, res) => {
  const usuario = carregarUsuarioHeader(req);

  if (!usuarioEhDesenvolvedor(usuario)) {
    return res.status(403).json({ ok: false, erro: "Acesso negado" });
  }

  const { empresa, dias = 15 } = req.body || {};
  const empresaNome = String(empresa || "").trim().toUpperCase().replace(/\s+/g, "_");

  if (!empresas[empresaNome]) {
    return res.status(404).json({ ok: false, erro: "Empresa não encontrada" });
  }

  empresas[empresaNome].trialAtivo = true;
  empresas[empresaNome].trialDias = Number(dias || 15);
  empresas[empresaNome].status = "liberada";
  empresas[empresaNome].plano = "teste";

  return res.json({ ok: true, empresa: empresas[empresaNome] });
});

app.post("/api/dev/plano", (req, res) => {
  const usuario = carregarUsuarioHeader(req);

  if (!usuarioEhDesenvolvedor(usuario)) {
    return res.status(403).json({ ok: false, erro: "Acesso negado" });
  }

  const { empresa, plano } = req.body || {};
  const empresaNome = String(empresa || "").trim().toUpperCase().replace(/\s+/g, "_");

  if (!empresas[empresaNome]) {
    return res.status(404).json({ ok: false, erro: "Empresa não encontrada" });
  }

  if (!planos[plano]) {
    return res.status(400).json({ ok: false, erro: "Plano inválido" });
  }

  empresas[empresaNome].plano = plano;
  empresas[empresaNome].funcoesLiberadas = [...planos[plano].funcoes];
  empresas[empresaNome].trialAtivo = false;
  empresas[empresaNome].trialDias = 0;

  return res.json({ ok: true, empresa: empresas[empresaNome] });
});

app.post("/api/dev/permissoes", (req, res) => {
  const usuario = carregarUsuarioHeader(req);

  if (!usuarioEhDesenvolvedor(usuario)) {
    return res.status(403).json({ ok: false, erro: "Acesso negado" });
  }

  const { user, permissoes = [] } = req.body || {};
  const alvo = usuarios.find(u => u.user === user);

  if (!alvo) {
    return res.status(404).json({ ok: false, erro: "Usuário não encontrado" });
  }

  alvo.permissoes = permissoes;

  return res.json({ ok: true, usuario: alvo });
});

app.get("/api/empresa/:nome", (req, res) => {
  const nome = String(req.params.nome || "").trim().toUpperCase().replace(/\s+/g, "_");
  const empresa = empresas[nome];

  if (!empresa) {
    return res.status(404).json({ ok: false, erro: "Empresa não encontrada" });
  }

  return res.json({ ok: true, empresa });
});

app.listen(PORT, () => {
  console.log("FASE 18 SAAS DEV rodando na porta " + PORT);
});
