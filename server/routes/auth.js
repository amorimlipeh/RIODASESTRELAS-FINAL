const express = require("express");
const { signToken, requireAuth } = require("../services/authService");

const router = express.Router();

const usuarios = [
  {
    id: 1,
    email: "desenvolvedor@rio.com",
    senha: "123",
    empresa_id: 0,
    empresa: "MASTER",
    tipo: "desenvolvedor"
  },
  {
    id: 2,
    email: "admin@empresa.com",
    senha: "123",
    empresa_id: 1,
    empresa: "EMPRESA_TESTE",
    tipo: "admin"
  },
  {
    id: 3,
    email: "operador@empresa.com",
    senha: "123",
    empresa_id: 1,
    empresa: "EMPRESA_TESTE",
    tipo: "operador"
  }
];

router.post("/login", (req, res) => {
  const { email, senha } = req.body || {};

  const user = usuarios.find(
    (u) =>
      u.email === String(email || "").trim() &&
      u.senha === String(senha || "").trim()
  );

  if (!user) {
    return res.status(401).json({
      ok: false,
      erro: "Email ou senha inválidos"
    });
  }

  const token = signToken(user);

  return res.json({
    ok: true,
    token,
    usuario: {
      id: user.id,
      email: user.email,
      empresa_id: user.empresa_id,
      empresa: user.empresa,
      tipo: user.tipo
    }
  });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({
    ok: true,
    usuario: req.user
  });
});

module.exports = router;
