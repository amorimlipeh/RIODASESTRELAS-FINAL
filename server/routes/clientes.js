const express = require("express");
const { readDb, writeDb, appendLog } = require("../lib/db");
const { requireAuth } = require("../services/authService");
const { requireRole } = require("../middleware/permissions");

const router = express.Router();

router.get("/", requireAuth, requireRole(["desenvolvedor","admin"]), (req, res) => {
  const db = readDb();
  res.json({ ok: true, clientes: db.companies });
});

router.get("/resumo", requireAuth, requireRole(["desenvolvedor","admin"]), (req, res) => {
  const db = readDb();
  const receita = db.companies.reduce((acc, c) => acc + Number(c.valor || 0), 0);
  res.json({ ok: true, totalClientes: db.companies.length, receita, atrasados: 0 });
});

router.post("/", requireAuth, requireRole(["desenvolvedor","admin"]), (req, res) => {
  const db = readDb();
  const cliente = {
    id: Date.now(),
    nome: String(req.body?.empresa || "").trim().toUpperCase(),
    plano: req.body?.plano || "profissional",
    valor: Number(req.body?.valor || 0),
    status: "ativo"
  };
  if (!cliente.nome) return res.status(400).json({ ok: false, erro: "Empresa obrigatória" });
  db.companies.push(cliente);
  writeDb(db);
  appendLog("empresa_criada", { nome: cliente.nome });
  res.json({ ok: true, cliente });
});

router.put("/:id", requireAuth, requireRole(["desenvolvedor","admin"]), (req, res) => {
  const db = readDb();
  const item = db.companies.find(c => c.id === Number(req.params.id));
  if (!item) return res.status(404).json({ ok: false, erro: "Empresa não encontrada" });
  item.status = req.body?.status || item.status;
  item.valor = req.body?.valor !== undefined ? Number(req.body.valor) : item.valor;
  writeDb(db);
  appendLog("empresa_atualizada", { id: item.id });
  res.json({ ok: true, cliente: item });
});

module.exports = router;
