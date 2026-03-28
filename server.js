
const express=require("express");
const path=require("path");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let estoque=[];
let clients=[];

// SSE conexão
app.get("/api/stream",(req,res)=>{
 res.set({
  "Content-Type":"text/event-stream",
  "Cache-Control":"no-cache",
  "Connection":"keep-alive"
 });
 res.flushHeaders();

 clients.push(res);

 req.on("close",()=> {
  clients=clients.filter(c=>c!==res);
 });
});

function broadcast(data){
 clients.forEach(c=>{
  c.write(`data: ${JSON.stringify(data)}\n\n`);
 });
}

// estoque
app.post("/api/estoque",(req,res)=>{
 const {codigo,qtd}=req.body;
 estoque.push({codigo,qtd});

 broadcast({tipo:"estoque",codigo,qtd});

 res.json({ok:true});
});

// listar
app.get("/api/estoque",(req,res)=>{
 res.json({ok:true,estoque});
});

app.listen(PORT,()=>console.log("TEMPO REAL "+PORT));
