
const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let estoque=[];
let logs=[];

function log(msg){
 logs.push({msg,time:new Date()});
}

// estoque
app.post("/api/estoque",(req,res)=>{
 const {codigo,qtd}=req.body;
 estoque.push({codigo,qtd});
 log("Entrada: "+codigo+" "+qtd);
 res.json({ok:true});
});

// listar
app.get("/api/estoque",(req,res)=>{
 res.json({ok:true,estoque});
});

// stats dashboard
app.get("/api/dashboard",(req,res)=>{
 let total=0;
 estoque.forEach(i=> total+=Number(i.qtd||0));

 res.json({
  ok:true,
  totalProdutos: estoque.length,
  totalQuantidade: total
 });
});

app.listen(PORT,()=>console.log("FASE13 "+PORT));
