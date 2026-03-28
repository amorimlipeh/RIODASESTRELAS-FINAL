
const express=require("express");
const router=express.Router();

router.get("/",(req,res)=>{
 res.json([{nome:"Cliente 1"},{nome:"Cliente 2"}]);
});

module.exports=router;
