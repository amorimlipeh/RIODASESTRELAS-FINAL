const express = require("express");
const path = require("path");
const multer = require("multer");
const XLSX = require("xlsx");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({ dest: "uploads/" });

let estoque = [];

// ================= IMPORTADOR =================
app.post("/api/importar", upload.single("file"), (req,res)=>{
 try{
  const wb = XLSX.readFile(req.file.path);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  const preview = data.slice(0,20);

  res.json({
    ok:true,
    total:data.length,
    preview
  });

 }catch(e){
  res.json({ok:false,erro:e.message});
 }
});

// ================= STATUS =================
app.get("/api/status",(req,res)=>{
 res.json({ok:true,msg:"importador ativo"});
});

app.listen(PORT,()=>{
 console.log("IMPORTADOR ATIVO "+PORT);
});
