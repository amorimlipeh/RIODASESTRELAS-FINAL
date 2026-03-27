const express=require("express");
const path=require("path");

const app=express();
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let estoque=[];
let pedidos=[];

function norm(e){
 e=String(e||"").replace(/\D/g,'');
 if(e.length!==7)return null;
 return `${e.slice(0,2)}-${e.slice(2,5)}-${e.slice(5,6)}-${e.slice(6,7)}`;
}

// estoque
app.post("/api/estoque",(req,res)=>{
 const {codigo,endereco,quantidade}=req.body;
 const end=norm(endereco);
 let i=estoque.find(x=>x.codigo===codigo&&x.endereco===end);
 if(!i){i={codigo,endereco:end,quantidade:0,reservado:0};estoque.push(i);}
 i.quantidade+=Number(quantidade||0);
 res.json({ok:true});
});

// pedido
app.post("/api/pedido",(req,res)=>{
 const p={id:Date.now(),itens:req.body.itens||[],status:"pendente"};
 pedidos.push(p);
 res.json({ok:true,p});
});

// picking
app.post("/api/picking/:id",(req,res)=>{
 const p=pedidos.find(x=>x.id==req.params.id);
 if(!p)return res.json({ok:false});

 p.itens.forEach(it=>{
  let rest=it.quantidade;
  estoque.forEach(e=>{
   let disp=e.quantidade-e.reservado;
   if(e.codigo===it.codigo && rest>0){
    let u=Math.min(disp,rest);
    e.reservado+=u;
    rest-=u;
   }
  });
  it.falta=rest;
 });

 p.status="separando";
 res.json({ok:true,p});
});

app.listen(3000);
