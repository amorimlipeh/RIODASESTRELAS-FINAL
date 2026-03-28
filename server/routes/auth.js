
const express=require("express");
const router=express.Router();
const jwt=require("jsonwebtoken");

router.post("/login",(req,res)=>{
 const token=jwt.sign({user:"admin"},process.env.JWT_SECRET);
 res.json({token});
});

module.exports=router;
