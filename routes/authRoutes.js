// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);//Permite que nuevos usuarios se creen. El usuario creado obtiene el rol de owner (como corregimos en el controlador).
router.post("/login", login); // Permite que un usuario existente ingrese y reciba el Token JWT.
module.exports = router;
