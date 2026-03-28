
const express = require("express");
const path = require("path");
const router = express.Router();
const { migrarArquivoLegado } = require("../services/migrationService");

router.post("/legado", async (req,res)=>{
  try{
    const file = req.body.file || "data/legado.json";
    const result = await migrarArquivoLegado(path.join(process.cwd(), file));
    res.json(result);
  }catch(e){
    res.status(500).json({ ok:false, erro: e.message });
  }
});

module.exports = router;
