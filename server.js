require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// LOGIN
app.get("/login", (req,res)=>{
  res.sendFile(path.join(__dirname,"public/login.html"));
});

// 🔥 APP REAL → aponta para seu sistema já existente
app.get("/app", (req,res)=>{
  res.sendFile(path.join(__dirname,"public","index.html"));
});

// mantém raiz também abrindo o sistema (compatibilidade)
app.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname,"public","index.html"));
});

// AUTH
app.use("/api/auth", require("./server/routes/auth"));

app.listen(PORT, ()=>console.log("APP REAL conectado " + PORT));
