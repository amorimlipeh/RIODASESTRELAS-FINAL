
function checkModuleAccess(modulo){
  return (req,res,next)=>{
    const user = req.user;
    if(!user) return res.status(401).json({ok:false});

    const permissoes = {
      desenvolvedor: ["*"],
      admin: ["estoque","picking","dashboard","usuarios"],
      operador: ["estoque","picking"]
    };

    const allowed = permissoes[user.tipo] || [];

    if(allowed.includes("*") || allowed.includes(modulo)){
      return next();
    }

    return res.status(403).json({ok:false, erro:"Sem acesso ao módulo"});
  }
}

module.exports = { checkModuleAccess };
