
const express=require("express");
const path=require("path");

const app=express();
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

// módulos por empresa
let empresas={
 "EMPRESA_TESTE":{
  modulos:["estoque","dashboard","picking"]
 }
};

// middleware de permissão
function check(modulo){
 return (req,res,next)=>{
  const emp=req.headers["x-empresa"]||"EMPRESA_TESTE";
  const conf=empresas[emp];

  if(!conf || !conf.modulos.includes(modulo)){
   return res.json({ok:false,erro:"Sem acesso ao módulo "+modulo});
  }
  next();
 };
}

// ROTAS PROTEGIDAS
app.get("/api/estoque",check("estoque"),(req,res)=>{
 res.json({ok:true,msg:"acesso estoque ok"});
});

app.get("/api/dashboard",check("dashboard"),(req,res)=>{
 res.json({ok:true,msg:"dashboard ok"});
});

app.get("/api/picking",check("picking"),(req,res)=>{
 res.json({ok:true,msg:"picking ok"});
});

// painel dev
app.post("/api/dev/modulos",(req,res)=>{
 const {empresa,modulos}=req.body;
 empresas[empresa]={modulos};
 res.json({ok:true});
});

app.listen(3000,()=>console.log("MODULAR ATIVO"));
