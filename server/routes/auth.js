const express = require("express");
const { readDb, appendLog } = require("../lib/db");
const { signToken, requireAuth } = require("../services/authService");

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, senha } = req.body || {};
  const db = readDb();
  const user = db.users.find(u =>
    String(u.email).toLowerCase() === String(email || "").trim().toLowerCase() &&
    String(u.senha) === String(senha || "").trim()
  );
  if (!user) return res.status(401).json({ ok: false, erro: "Email ou senha inválidos" });

  const token = signToken(user);
  appendLog("login", { email: user.email, tipo: user.tipo });

  res.json({
    ok: true,
    token,
    usuario: {
      id: user.id,
      email: user.email,
      empresa: user.empresa,
      tipo: user.tipo
    }
  });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ ok: true, usuario: req.user });
});

module.exports = router;
