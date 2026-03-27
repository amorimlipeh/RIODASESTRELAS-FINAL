const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let estoque=[];

// adicionar estoque
app.post("/api/estoque",(req,res)=>{
 const {codigo,qtd}=req.body;
 estoque.push({codigo,qtd});
 res.json({ok:true});
});

// listar
app.get("/api/estoque",(req,res)=>{
 res.json({ok:true,estoque});
});

app.listen(PORT,()=>console.log("FINAL OK "+PORT));
