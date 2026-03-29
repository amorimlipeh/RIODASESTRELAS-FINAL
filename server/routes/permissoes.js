const express = require("express");
const { requireAuth } = require("../services/authService");
const { requireRole } = require("../middleware/permissions");

const router = express.Router();

router.get("/admin-only", requireAuth, requireRole(["desenvolvedor","admin"]), (req, res) => {
  res.json({ ok: true, msg: "Acesso permitido" });
});

module.exports = router;
