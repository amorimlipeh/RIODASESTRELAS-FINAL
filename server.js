
require("dotenv").config();
const express=require("express");
const app=express();

app.use(express.json());

app.get("/",(req,res)=>res.send("RIO V5 PROFISSIONAL"));

app.use("/api/auth",require("./server/routes/auth"));
app.use("/api/clientes",require("./server/routes/clientes"));

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log("V5 rodando "+PORT));
