const express = require("express");
const router = express.Router();

// 1. Importación del Controlador
// Importamos el objeto completo que contiene todas las funciones CRUD
const movieController = require("../controllers/movieController.js");

// 2. Importación del Middleware (Asegúrate que la ruta y el nombre del archivo sean exactos)
const { protect, roleCheck } = require("../middleware/authMiddleware.js");

// ===========================================
// RUTAS
// ===========================================

// Rutas públicas (Listar todas y Obtener por ID)
// URI: /api/movies
router.get("/", movieController.getMovies);

// URI: /api/movies/:id
router.get("/:id", movieController.getMovieDetail);

// Rutas privadas (CRUD completo)

// URI: /api/movies (POST - Crear Película)
router.post(
  "/",
  protect, // 🛡️ Requerir token JWT
  roleCheck(["owner", "admin"]), // 🛡️ Restringir a Owner o Admin
  movieController.createMovie
);

// URI: /api/movies/:id (PUT - Actualizar Película)
router.put(
  "/:id",
  protect, // 🛡️ Requerir token JWT
  roleCheck(["owner", "admin"]), // 🛡️ Restringir a Owner o Admin
  movieController.updateMovie
);

// URI: /api/movies/:id (DELETE - Eliminar Película)
router.delete(
  "/:id",
  protect, // 🛡️ Requerir token JWT
  roleCheck(["owner", "admin"]), // 🛡️ Restringir a Owner o Admin
  movieController.deleteMovie
);

// Exportar el router para que server.js lo pueda usar
module.exports = router;
