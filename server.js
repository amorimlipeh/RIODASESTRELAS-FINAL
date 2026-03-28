
const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let pedidos=[
 {id:1,itens:["A","B"],prioridade:2},
 {id:2,itens:["C"],prioridade:1}
];

// IA decisão automática
app.get("/api/auto",(req,res)=>{
 let ordenado=[...pedidos].sort((a,b)=>a.prioridade-b.prioridade);

 res.json({
  ok:true,
  proximo:ordenado[0],
  fila:ordenado
 });
});

app.listen(PORT,()=>console.log("AUTOMAÇÃO TOTAL"));
