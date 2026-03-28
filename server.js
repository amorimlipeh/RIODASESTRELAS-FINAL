
const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let empresas={
 "EMPRESA_TESTE":{
  modulos:["estoque","dashboard","picking","wms"]
 }
};

app.get("/api/modulos",(req,res)=>{
 const emp=req.headers["x-empresa"]||"EMPRESA_TESTE";
 res.json({ok:true,modulos:(empresas[emp]||{modulos:[]}).modulos});
});

app.get("/api/estoque",(req,res)=>res.json({ok:true,data:["A123","B456"]}));
app.get("/api/dashboard",(req,res)=>res.json({ok:true,data:{produtos:10}}));
app.get("/api/picking",(req,res)=>res.json({ok:true,data:["A123","B456"]}));
app.get("/api/wms",(req,res)=>res.json({ok:true,data:"mapa"}));

app.listen(PORT,()=>console.log("UI PRO ATIVO "+PORT));
