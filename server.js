require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Rutas
const movieRoutes = require("./routes/movieRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const testRoute = require("./routes/testRoute");
const externalAPIRoutes = require("./routes/externalAPI");

// Modelos
const Movie = require("./models/Movie");

const app = express();

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))
        return callback(null, true);
      callback(new Error("CORS no permitido: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Conectar DB
connectDB();

// Ruta debug
app.get("/api/debug/movies-count", async (req, res, next) => {
  try {
    const count = await Movie.countDocuments();
    res.json({ ok: true, count });
  } catch (err) {
    next(err);
  }
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/external", externalAPIRoutes); // TMDb
app.use("/api", testRoute);

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Error interno del servidor" });
});

// Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
  console.log(`CORS habilitado para: ${allowedOrigins.join(", ")}`);
});
