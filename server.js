const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let estoque = [];

function normalizarEndereco(e){
  if(!e) return null;
  e = String(e).replace(/\D/g,'');
  if(e.length !== 7) return null;
  return `${e.slice(0,2)}-${e.slice(2,5)}-${e.slice(5,6)}-${e.slice(6,7)}`;
}

// STATUS
app.get("/api/status", (req, res) => {
  res.json({ ok: true, sistema: "RIO DAS ESTRELAS", status: "online" });
});

// ENTRADA ESTOQUE
app.post("/api/estoque/entrada",(req,res)=>{
  const {codigo,endereco,quantidade} = req.body;
  const end = normalizarEndereco(endereco);
  if(!end) return res.json({ok:false,erro:"endereco invalido"});

  let item = estoque.find(i=>i.codigo===codigo && i.endereco===end);
  if(!item){
    item = {codigo,endereco:end,quantidade:0};
    estoque.push(item);
  }

  item.quantidade += Number(quantidade||0);
  res.json({ok:true});
});

// LISTAR ESTOQUE
app.get("/api/estoque",(req,res)=>{
  res.json({ok:true,estoque});
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
