
const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let estoque=[];
let bloqueados=new Set();
let fixos={};

function norm(e){
 e=String(e||"").replace(/\D/g,'');
 if(e.length!==7)return null;
 return `${e.slice(0,2)}-${e.slice(2,5)}-${e.slice(5,6)}-${e.slice(6,7)}`;
}

// bloquear endereço
app.post("/api/wms/bloquear",(req,res)=>{
 const {endereco}=req.body;
 const end=norm(endereco);
 bloqueados.add(end);
 res.json({ok:true});
});

// fixar produto
app.post("/api/wms/fixar",(req,res)=>{
 const {codigo,endereco}=req.body;
 const end=norm(endereco);
 fixos[end]=codigo;
 res.json({ok:true});
});

// entrada estoque com validação
app.post("/api/estoque",(req,res)=>{
 const {codigo,endereco,qtd}=req.body;
 const end=norm(endereco);

 if(bloqueados.has(end)){
  return res.json({ok:false,erro:"ENDEREÇO BLOQUEADO"});
 }

 if(fixos[end] && fixos[end]!==codigo){
  return res.json({ok:false,erro:"ENDEREÇO FIXO PARA OUTRO PRODUTO"});
 }

 let i=estoque.find(x=>x.codigo===codigo && x.endereco===end);
 if(!i){
  i={codigo,endereco:end,quantidade:0};
  estoque.push(i);
 }

 i.quantidade+=Number(qtd||0);
 res.json({ok:true});
});

// grid
app.get("/api/wms",(req,res)=>{
 const grid={};

 for(let r=1;r<=3;r++){
  const rua=String(r).padStart(2,"0");
  grid[rua]={};

  for(let p=1;p<=10;p++){
   const pos=String(p).padStart(3,"0");
   const end=rua+"-"+pos+"-1-1";

   const item=estoque.find(e=>e.endereco===end);

   let status="vazio";
   if(bloqueados.has(end)) status="bloqueado";
   else if(item) status="ocupado";

   grid[rua][pos]={
    status,
    produto:item?.codigo||""
   };
  }
 }

 res.json({ok:true,grid});
});

app.listen(PORT,()=>console.log("WMS PROF "+PORT));
