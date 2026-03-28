
const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let estoque=[
 {codigo:"A",endereco:"01-001-1-1"},
 {codigo:"B",endereco:"01-010-1-1"},
 {codigo:"C",endereco:"02-005-1-1"}
];

// calcular rota (ordenar por rua e posição)
function ordenar(end){
 const [r,p]=end.split("-");
 return {r:parseInt(r),p:parseInt(p)};
}

app.post("/api/rota",(req,res)=>{
 const {itens}=req.body;

 let lista=[];

 itens.forEach(cod=>{
  const item=estoque.find(e=>e.codigo===cod);
  if(item) lista.push(item);
 });

 lista.sort((a,b)=>{
  const A=ordenar(a.endereco);
  const B=ordenar(b.endereco);

  if(A.r!==B.r) return A.r-B.r;
  return A.p-B.p;
 });

 res.json({ok:true,rota:lista});
});

app.listen(PORT,()=>console.log("ROTA INTELIGENTE"));
