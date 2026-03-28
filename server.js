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

// APP (SISTEMA REAL)
app.get("/app", (req,res)=>{
  res.sendFile(path.join(__dirname,"public/app.html"));
});

app.use("/api/auth", require("./server/routes/auth"));

app.listen(PORT, ()=>console.log("Fluxo profissional ativo " + PORT));
