
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/login", (req,res)=>{
  const token = jwt.sign({ user: "admin" }, process.env.JWT_SECRET);
  res.json({ ok:true, token });
});

module.exports = router;
