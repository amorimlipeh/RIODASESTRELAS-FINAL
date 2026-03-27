const express=require("express");
const path=require("path");
const multer=require("multer");
const XLSX=require("xlsx");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

const upload=multer({dest:"uploads/"});

let estoque=[];

// importar + aplicar
app.post("/api/importar-aplicar",upload.single("file"),(req,res)=>{
 try{
  const wb=XLSX.readFile(req.file.path);
  const sheet=wb.Sheets[wb.SheetNames[0]];
  const data=XLSX.utils.sheet_to_json(sheet);

  data.forEach(r=>{
    if(!r.codigo) return;

    estoque.push({
      codigo:String(r.codigo),
      quantidade:Number(r.quantidade||0),
      endereco:"01-001-1-1"
    });
  });

  res.json({ok:true,total:data.length});
 }catch(e){
  res.json({ok:false,erro:e.message});
 }
});

// listar
app.get("/api/estoque",(req,res)=>{
 res.json({ok:true,estoque});
});

app.listen(PORT,()=>console.log("INTEGRADO "+PORT));
