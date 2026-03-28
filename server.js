
const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let estoque=[];
let logs=[];

// LOG
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

// logs
app.get("/api/logs",(req,res)=>{
 res.json({ok:true,logs});
});

app.listen(PORT,()=>console.log("ENTERPRISE FINAL "+PORT));
