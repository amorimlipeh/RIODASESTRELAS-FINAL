
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../services/authService");
const { requireRole } = require("../middleware/permissions");

// só admin ou desenvolvedor
router.get("/admin-only",
  requireAuth,
  requireRole(["admin","desenvolvedor"]),
  (req,res)=>{
    res.json({ ok:true, msg:"Acesso permitido" });
  }
);

module.exports = router;
