function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, erro: "Não autenticado" });
    if (!roles.includes(req.user.tipo)) return res.status(403).json({ ok: false, erro: "Sem permissão" });
    next();
  };
}
module.exports = { requireRole };
