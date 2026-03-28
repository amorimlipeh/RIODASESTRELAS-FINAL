
const express=require("express");
const fs=require("fs");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

const dbPath=path.join(__dirname,"data/clientes.json");

function load(){
 return JSON.parse(fs.readFileSync(dbPath));
}
function save(d){
 fs.writeFileSync(dbPath,JSON.stringify(d,null,2));
}

// auto bloqueio
setInterval(()=>{
 let db=load();
 let now=Date.now();
 db.clientes.forEach(c=>{
  if(now>c.vencimento && c.status!=="bloqueado"){
   c.status="bloqueado";
  }
 });
 save(db);
},5000);

// listar
app.get("/api/clientes",(req,res)=>{
 res.json(load().clientes);
});

// pagar
app.post("/api/pagar",(req,res)=>{
 let db=load();
 let c=db.clientes.find(x=>x.id==req.body.id);
 if(c){
  c.vencimento=Date.now()+60000;
  c.status="ativo";
  save(db);
 }
 res.json({ok:true});
});

app.listen(PORT,()=>console.log("FINAL RODANDO"));
