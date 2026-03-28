
const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let estoque=[];
let notificacoes=[];

function addNotificacao(msg){
 notificacoes.push({msg,time:new Date()});
 if(notificacoes.length>50) notificacoes.shift();
}

// estoque
app.post("/api/estoque",(req,res)=>{
 const {codigo,qtd}=req.body;
 estoque.push({codigo,qtd});

 if(Number(qtd)<=5){
  addNotificacao("⚠️ Estoque baixo: "+codigo);
 }

 res.json({ok:true});
});

// listar estoque
app.get("/api/estoque",(req,res)=>{
 res.json({ok:true,estoque});
});

// notificacoes
app.get("/api/notificacoes",(req,res)=>{
 res.json({ok:true,notificacoes});
});

app.listen(PORT,()=>console.log("FASE14 "+PORT));
