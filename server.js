require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// HOME agora carrega a interface real
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// AUTH
app.use("/api/auth", require("./server/routes/auth"));

const { requireAuth } = require("./server/services/authService");

// rota protegida de teste
app.get("/api/auth-check", requireAuth, (req, res) => {
  res.json({
    ok: true,
    usuario: req.user
  });
});

app.listen(PORT, () => {
  console.log("RIO FRONT + AUTH rodando na porta " + PORT);
});
