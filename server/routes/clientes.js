
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req,res)=>{
  try{
    const { rows } = await pool.query("SELECT c.id, c.nome, c.plano, c.ativo, e.nome AS empresa FROM clientes c LEFT JOIN empresas e ON e.id = c.empresa_id ORDER BY c.id DESC");
    res.json({ ok:true, clientes: rows });
  }catch(e){
    res.status(500).json({ ok:false, erro: e.message });
  }
});

module.exports = router;
