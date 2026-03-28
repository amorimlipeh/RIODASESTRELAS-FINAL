
require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => res.send("RIO V5 PROFISSIONAL"));

// ROTAS
app.use("/api/permissoes", require("./server/routes/permissoes"));

// TESTE
app.get("/api/teste", (req,res)=>res.json({ok:true}));

app.listen(PORT, () => console.log("Servidor com permissões ativo " + PORT));
