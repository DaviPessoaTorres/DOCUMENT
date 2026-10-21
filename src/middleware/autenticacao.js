
function exigirLogin(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({
      erro: "Faça login para continuar.",
    });
  }

  next();
}

function exigirAdministrador(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({
      erro: "Faça login para continuar.",
    });
  }

  if (req.session.usuario.tipo !== "administrador") {
    return res.status(403).json({
      erro: "Acesso permitido apenas para administradores.",
    });
  }

  next();
}

module.exports = {
  exigirLogin,
  exigirAdministrador,
};
