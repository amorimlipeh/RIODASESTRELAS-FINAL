
const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let empresas={
 "EMPRESA_TESTE":{
  plano:"teste",
  vencimento:Date.now()+7*86400000,
  ativa:true
 }
};

// validar acesso
app.use((req,res,next)=>{
 const emp=req.headers["x-empresa"];
 if(!emp) return next();

 const e=empresas[emp];
 if(!e) return res.json({ok:false,erro:"empresa não existe"});

 if(Date.now()>e.vencimento){
  e.ativa=false;
  return res.json({ok:false,erro:"plano vencido"});
 }

 next();
});

// pagar (simulado)
app.post("/api/pagar",(req,res)=>{
 const {empresa,dias}=req.body;
 if(!empresas[empresa]) return res.json({ok:false});

 empresas[empresa].vencimento=Date.now()+Number(dias||30)*86400000;
 empresas[empresa].ativa=true;

 res.json({ok:true});
});

// status
app.get("/api/status/:empresa",(req,res)=>{
 const e=empresas[req.params.empresa];
 res.json({ok:true,empresa:e});
});

app.listen(PORT,()=>console.log("COBRANÇA ATIVA"));
