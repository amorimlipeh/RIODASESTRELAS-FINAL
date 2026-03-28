require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// LOGIN
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// APP REAL
app.get("/app", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "app.html"));
});

// raiz continua no login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.use("/api/auth", require("./server/routes/auth"));

const { requireAuth } = require("./server/services/authService");

app.get("/api/auth-check", requireAuth, (req, res) => {
  res.json({ ok: true, usuario: req.user });
});

app.listen(PORT, () => {
  console.log("LOGIN + APP REAL na porta " + PORT);
});
