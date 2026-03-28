
const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let rota=[
 {codigo:"A",endereco:"01-001-1-1",qtd:2},
 {codigo:"B",endereco:"01-010-1-1",qtd:1}
];

app.get("/api/picking",(req,res)=>{
 res.json({ok:true,rota});
});

app.listen(PORT,()=>console.log("VOZ ATIVA"));
