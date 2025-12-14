const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Genera un JWT seguro con id y role.
 */
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET no definido en .env");
  }

  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

/**
 * REGISTRO
 * POST /auth/register
 */
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña son obligatorios",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "Usuario ya registrado",
      });
    }

    const user = await User.create({
      email,
      password,
      role: "owner", // fijo, según tu diseño
    });

    return res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("Error en register:", error);

    return res.status(500).json({
      message: "Error al registrar usuario",
      // safe debug: solo en dev
      ...(process.env.NODE_ENV === "development"
        ? { detail: error.message }
        : {}),
    });
  }
};

/**
 * LOGIN
 * POST /auth/login
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("[LOGIN] intento:", email); // 👈 línea 1
    if (!email || !password) {
      return res.status(400).json({
        message: "Credenciales obligatorias",
      });
    }

    const user = await User.findOne({ email });
    console.log("[LOGIN] usuario encontrado?", !!user); // 👈 línea 2

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Email o contraseña incorrectos",
      });
    }

    return res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      message: "Error al iniciar sesión",
    });
  }
};
