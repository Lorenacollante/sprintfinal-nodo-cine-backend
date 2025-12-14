const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acceso denegado: token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Usuario no válido" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "El token ha expirado" });
    }

    return res.status(401).json({ message: "Token inválido" });
  }
};

const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Se requiere autenticación" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Acceso denegado. Rol '${req.user.role}' no autorizado.`,
      });
    }

    next();
  };
};

module.exports = { protect, roleCheck };
