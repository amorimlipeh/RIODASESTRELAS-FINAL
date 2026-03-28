
const express=require("express");
const path=require("path");
const multer=require("multer");
const XLSX=require("xlsx");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

const upload=multer({dest:"uploads/"});

// ===== DATA =====
let empresas={};
let usuarios=[];
let logs=[];
let notificacoes=[];
let clients=[];

// ===== UTILS =====
function log(msg){
 logs.push({msg,time:new Date()});
}

function notify(msg){
 notificacoes.push({msg,time:new Date()});
 broadcast({tipo:"notificacao",msg});
}

function broadcast(data){
 clients.forEach(c=>c.write(`data: ${JSON.stringify(data)}\n\n`));
}

// ===== SSE =====
app.get("/api/stream",(req,res)=>{
 res.set({
  "Content-Type":"text/event-stream",
  "Cache-Control":"no-cache",
  "Connection":"keep-alive"
 });
 res.flushHeaders();
 clients.push(res);

 req.on("close",()=>clients=clients.filter(c=>c!==res));
});

// ===== LOGIN =====
app.post("/api/login",(req,res)=>{
 const {user,senha}=req.body;
 const u=usuarios.find(x=>x.user===user && x.senha===senha);
 if(!u) return res.json({ok:false});
 res.json({ok:true,usuario:u});
});

// ===== ESTOQUE =====
app.post("/api/estoque",(req,res)=>{
 const {codigo,qtd,empresa}=req.body;

 if(!empresas[empresa]) empresas[empresa]={estoque:[]};

 empresas[empresa].estoque.push({codigo,qtd});
 log("Entrada "+codigo);

 if(Number(qtd)<=5){
  notify("Estoque baixo: "+codigo);
 }

 broadcast({tipo:"estoque",codigo,qtd});

 res.json({ok:true});
});

app.get("/api/estoque/:empresa",(req,res)=>{
 const emp=req.params.empresa;
 res.json({ok:true,estoque:(empresas[emp]||{estoque:[]}).estoque});
});

// ===== IMPORTADOR =====
app.post("/api/importar",upload.single("file"),(req,res)=>{
 try{
  const wb=XLSX.readFile(req.file.path);
  const sheet=wb.Sheets[wb.SheetNames[0]];
  const data=XLSX.utils.sheet_to_json(sheet);

  res.json({ok:true,preview:data.slice(0,20)});
 }catch(e){
  res.json({ok:false,erro:e.message});
 }
});

// ===== IA =====
app.get("/api/ia",(req,res)=>{
 let alertas=[];
 let sugestoes=[];

 Object.values(empresas).forEach(emp=>{
  emp.estoque.forEach(p=>{
   if(p.qtd<=5) alertas.push("Falta: "+p.codigo);
   if(p.qtd>80) sugestoes.push("Mover: "+p.codigo);
  });
 });

 res.json({ok:true,alertas,sugestoes});
});

// ===== DASHBOARD =====
app.get("/api/dashboard",(req,res)=>{
 let total=0;
 let count=0;

 Object.values(empresas).forEach(emp=>{
  emp.estoque.forEach(i=>{
   total+=Number(i.qtd||0);
   count++;
  });
 });

 res.json({ok:true,totalProdutos:count,totalQuantidade:total});
});

// ===== LOGS =====
app.get("/api/logs",(req,res)=>{
 res.json({ok:true,logs});
});

// ===== NOTIF =====
app.get("/api/notificacoes",(req,res)=>{
 res.json({ok:true,notificacoes});
});

app.listen(PORT,()=>console.log("BASE V2 RODANDO "+PORT));
