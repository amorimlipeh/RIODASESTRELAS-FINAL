
function requireRole(roles = []) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ ok:false, erro:"Não autenticado" });
    }

    if (!roles.includes(user.tipo)) {
      return res.status(403).json({ ok:false, erro:"Sem permissão" });
    }

    next();
  };
}

module.exports = { requireRole };
