const jwt = require("jsonwebtoken");

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      empresa_id: user.empresa_id,
      empresa: user.empresa,
      tipo: user.tipo
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const [type, token] = auth.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      ok: false,
      erro: "Token não enviado"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({
      ok: false,
      erro: "Token inválido"
    });
  }
}

module.exports = {
  signToken,
  requireAuth
};
