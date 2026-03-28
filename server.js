
const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let empresas={
 "A":{estoque:[]},
 "B":{estoque:[]}
};

let usuarios=[
 {user:"admin",senha:"123",empresa:"A",tipo:"admin"},
 {user:"op",senha:"123",empresa:"A",tipo:"operador"}
];

// login simples
app.post("/api/login",(req,res)=>{
 const {user,senha}=req.body;
 const u=usuarios.find(x=>x.user===user && x.senha===senha);
 if(!u) return res.json({ok:false});
 res.json({ok:true,usuario:u});
});

// estoque por empresa
app.post("/api/estoque",(req,res)=>{
 const {codigo,qtd,empresa}=req.body;

 if(!empresas[empresa]) return res.json({ok:false});

 empresas[empresa].estoque.push({codigo,qtd});
 res.json({ok:true});
});

app.get("/api/estoque/:empresa",(req,res)=>{
 const emp=req.params.empresa;
 res.json({ok:true,estoque:empresas[emp].estoque});
});

app.listen(PORT,()=>console.log("MULTI EMPRESA "+PORT));
