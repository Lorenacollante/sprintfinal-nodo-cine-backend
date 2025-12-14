// controllers/movieController.js
const Movie = require("../models/Movie.js");
const { RATINGS_LIST } = require("../utils/constants");

// ===============================
// MANEJADOR CENTRAL DE ERRORES
// ===============================
const handleError = (
  res,
  error,
  customMessage = "Error interno del servidor"
) => {
  console.error(`[Movie Controller Error] ${customMessage}`, error.message);

  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  if (error.kind === "ObjectId" || error.name === "CastError") {
    return res
      .status(404)
      .json({ message: "ID de recurso inválido o no encontrado." });
  }

  res.status(500).json({ message: customMessage });
};

// ====================================
// FUNCIÓN AUXILIAR → Clasificaciones permitidas
// ====================================
const getAllowedRatings = (maxRating) => {
  const index = RATINGS_LIST.indexOf(maxRating);
  return RATINGS_LIST.slice(0, index + 1);
};

// ====================================
// Construir Query de Búsqueda
// ====================================
const buildSearchQuery = (search) => {
  if (!search) return null;

  return {
    $or: [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ],
  };
};

// ====================================
// Normalizar Body Entrante
// ====================================
const normalizeMoviePayload = (body) => {
  const {
    title,
    description,
    overview,
    year,
    releaseYear,
    genres,
    image,
    posterUrl,
    trailerUrl,
    ageRating,
    isKidFriendly,
    rating,
    externalId,
  } = body;

  const normalized = {
    title: title?.trim() ?? null,
    description: (description ?? overview ?? "").trim(),
    year: Number(year ?? releaseYear) || null,
    genres: Array.isArray(genres) ? genres : [],
    posterUrl: posterUrl ?? null,
    image: image ?? null,
    trailerUrl: trailerUrl ?? null,
    ageRating: ageRating ?? "G",
    isKidFriendly: Boolean(isKidFriendly),
    rating: typeof rating === "number" ? rating : null,
    externalId: externalId ?? null,
  };

  Object.keys(normalized).forEach((k) => {
    if (typeof normalized[k] === "string" && normalized[k].trim() === "") {
      normalized[k] = null;
    }
  });

  return normalized;
};

// ====================================
// GET /movies
// ====================================
const getMovies = async (req, res) => {
  try {
    const { search, year, page = 1, limit = 50, maxRating } = req.query;

    const query = {};

    const searchQuery = buildSearchQuery(search);
    if (searchQuery) Object.assign(query, searchQuery);

    if (year) query.year = Number(year);

    if (maxRating) {
      const allowedRatings = getAllowedRatings(maxRating);
      query.ageRating = { $in: allowedRatings };
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;

    const [count, movies] = await Promise.all([
      Movie.countDocuments(query),
      Movie.find(query)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ year: -1 }),
    ]);

    res.json({
      movies,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalResults: count,
    });
  } catch (error) {
    handleError(res, error, "Error al obtener películas con filtro");
  }
};

// ====================================
// GET /movies/:id
// ====================================
const getMovieDetail = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Película no encontrada" });
    }

    res.json(movie);
  } catch (error) {
    handleError(res, error, "Error al obtener detalle de película");
  }
};

// ====================================
// POST /movies
// ====================================
const createMovie = async (req, res) => {
  try {
    const normalized = normalizeMoviePayload(req.body);

    // --- Validaciones ---
    if (!normalized.title) {
      return res.status(400).json({ message: "El título es obligatorio" });
    }

    if (!normalized.year) {
      return res.status(400).json({ message: "El año es obligatorio" });
    }

    if (isNaN(normalized.year) || normalized.year < 1888) {
      return res.status(400).json({
        message: "Año inválido (debe ser numérico y mayor a 1888)",
      });
    }

    if (!Array.isArray(normalized.genres) || normalized.genres.length === 0) {
      return res
        .status(400)
        .json({ message: "Debe incluir al menos un género" });
    }

    if (!RATINGS_LIST.includes(normalized.ageRating)) {
      return res.status(400).json({
        message: `Clasificación de edad no válida. Debe ser una de: ${RATINGS_LIST.join(
          ", "
        )}`,
      });
    }

    // Normalización segura de imagen local
    if (normalized.image) {
      normalized.image = normalized.image.trim();

      if (!/^https?:\/\//.test(normalized.image)) {
        if (!normalized.image.startsWith("/")) {
          normalized.image = "/" + normalized.image;
        }
      }
    }

    const newMovie = await Movie.create(normalized);
    return res.status(201).json(newMovie);
  } catch (error) {
    handleError(res, error, "Error al crear la película");
  }
};

// ====================================
// PUT /movies/:id
// ====================================
const updateMovie = async (req, res) => {
  try {
    const current = await Movie.findById(req.params.id);
    if (!current) {
      return res
        .status(404)
        .json({ message: "Película a actualizar no encontrada" });
    }

    const updates = normalizeMoviePayload(req.body);

    // --- Validaciones ---
    if (updates.ageRating && !RATINGS_LIST.includes(updates.ageRating)) {
      return res.status(400).json({
        message: `Clasificación de edad no válida. Debe ser una de: ${RATINGS_LIST.join(
          ", "
        )}`,
      });
    }

    if (updates.year && (isNaN(updates.year) || updates.year < 1888)) {
      return res.status(400).json({
        message: "Año inválido (debe ser numérico y mayor a 1888)",
      });
    }

    if (updates.genres && !Array.isArray(updates.genres)) {
      return res.status(400).json({
        message: "El campo genres debe ser un array de strings",
      });
    }

    // Normalización segura de imagen
    if (updates.image) {
      updates.image = updates.image.trim();

      if (!/^https?:\/\//.test(updates.image)) {
        if (!updates.image.startsWith("/")) {
          updates.image = "/" + updates.image;
        }
      }
    }

    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(updatedMovie);
  } catch (error) {
    handleError(res, error, "Error al actualizar la película");
  }
};

// ====================================
// DELETE /movies/:id
// ====================================
const deleteMovie = async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

    if (!deletedMovie) {
      return res
        .status(404)
        .json({ message: "Película a eliminar no encontrada" });
    }

    res.json({ ok: true, message: "Película eliminada correctamente" });
  } catch (error) {
    handleError(res, error, "Error al eliminar la película");
  }
};

module.exports = {
  getMovies,
  getMovieDetail,
  createMovie,
  updateMovie,
  deleteMovie,
};
