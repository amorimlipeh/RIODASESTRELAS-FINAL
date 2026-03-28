
const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let estoque=[
 {codigo:"A",qtd:50},
 {codigo:"B",qtd:3},
 {codigo:"C",qtd:100}
];

// IA simples
app.get("/api/ia",(req,res)=>{
 let alertas=[];
 let sugestoes=[];

 estoque.forEach(p=>{
  if(p.qtd<=5){
   alertas.push("Falta iminente: "+p.codigo);
  }
  if(p.qtd>80){
   sugestoes.push("Produto com alto volume: "+p.codigo+" → enviar para rua rápida");
  }
 });

 res.json({ok:true,alertas,sugestoes});
});

app.listen(PORT,()=>console.log("IA ATIVA "+PORT));
