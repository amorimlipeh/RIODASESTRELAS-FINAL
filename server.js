
const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let estoque=[];
let ocupacao={};

// gerar endereço inteligente
function gerarEndereco(){
 for(let r=1;r<=5;r++){
  for(let p=1;p<=20;p++){
   let end=`0${r}-${String(p).padStart(3,"0")}-1-1`;
   if(!ocupacao[end]){
    return end;
   }
  }
 }
 return null;
}

// entrada com sugestão
app.post("/api/estoque",(req,res)=>{
 const {codigo,qtd}=req.body;

 let endereco=gerarEndereco();

 if(!endereco){
  return res.json({ok:false,erro:"Sem espaço"});
 }

 ocupacao[endereco]=true;

 estoque.push({codigo,qtd,endereco});

 res.json({ok:true,endereco});
});

// listar
app.get("/api/estoque",(req,res)=>{
 res.json({ok:true,estoque});
});

app.listen(PORT,()=>console.log("WMS INTELIGENTE"));
