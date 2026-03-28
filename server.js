
const express=require("express");
const app=express();
app.use(express.json());
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
let clientes=[
 {id:1,empresa:"EMPRESA_TESTE",vencimento:Date.now()+5000,status:"ativo",valor:99}
];

// rotina automática
setInterval(()=>{
 const agora=Date.now();
 clientes.forEach(c=>{
  if(agora>c.vencimento && c.status!=="bloqueado"){
   c.status="bloqueado";
   console.log("Bloqueado:",c.empresa);
  }
 });
},3000);

// pagar
app.post("/api/pagar",(req,res)=>{
 const {id}=req.body;
 const c=clientes.find(x=>x.id==id);
 if(!c) return res.json({ok:false});
 c.vencimento=Date.now()+30000;
 c.status="ativo";
 res.json({ok:true});
});

// listar
app.get("/api/clientes",(req,res)=>{
 res.json(clientes);
});

app.listen(process.env.PORT||3000,()=>console.log("COBRANÇA AUTO"));
