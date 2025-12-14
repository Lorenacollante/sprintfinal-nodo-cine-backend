// seeder.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fetch = require("node-fetch"); // v2 compatible con require
const Movie = require("./models/Movie");

dotenv.config();

const API_KEY = process.env.TMDB_API_KEY;
const MONGO_URI = process.env.MONGO_URI;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const VALID_RATINGS = ["G", "PG", "PG-13", "R", "NC-17"];

// ===============================
// Obtener certificación (rating) de TMDB
// ===============================
const getMovieCertifications = async (movieId) => {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/release_dates?api_key=${API_KEY}`
    );
    if (!res.ok) return "UNKNOWN";
    const data = await res.json();
    const US_release = (data.results || []).find((r) => r.iso_3166_1 === "US");
    if (
      US_release &&
      US_release.release_dates &&
      US_release.release_dates.length > 0
    ) {
      return US_release.release_dates.pop().certification || "UNKNOWN";
    }
    return "UNKNOWN";
  } catch (e) {
    console.error("Error en getMovieCertifications:", e.message);
    return "UNKNOWN";
  }
};

// ===============================
// Mapear datos de TMDB al esquema Movie
// ===============================
const mapTmdbToMovieSchema = async (tmdbMovie, genresMap) => {
  try {
    const imageUrlBase = "https://image.tmdb.org/t/p/w500";
    const certification = await getMovieCertifications(tmdbMovie.id);

    if (!tmdbMovie.overview || tmdbMovie.overview.trim().length === 0) {
      console.log(`Omitida (sin descripción): ${tmdbMovie.title}`);
      return null;
    }

    const genres = (tmdbMovie.genre_ids || [])
      .map((id) => genresMap[id])
      .filter(Boolean);
    const year = tmdbMovie.release_date
      ? parseInt(tmdbMovie.release_date.substring(0, 4))
      : null;
    if (!year) {
      console.log(`Omitida (sin año): ${tmdbMovie.title}`);
      return null;
    }

    const finalRating = VALID_RATINGS.includes(certification)
      ? certification
      : "PG-13";

    return {
      title: tmdbMovie.title,
      description: tmdbMovie.overview,
      year,
      genres: genres.slice(0, 3),
      ageRating: finalRating,
      image: tmdbMovie.poster_path
        ? `${imageUrlBase}${tmdbMovie.poster_path}`
        : undefined,
      trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        tmdbMovie.title
      )}+trailer`,
      isKidFriendly: ["G", "PG"].includes(certification),
    };
  } catch (e) {
    console.error("Error en mapTmdbToMovieSchema:", e.message);
    return null;
  }
};

// ===============================
// Obtener géneros de TMDB
// ===============================
const getGenresMap = async () => {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=es`
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(
        "Error obteniendo géneros TMDB:",
        res.status,
        err.status_message || res.statusText
      );
      return {};
    }
    const data = await res.json();
    const map = {};
    (data.genres || []).forEach((g) => (map[g.id] = g.name));
    return map;
  } catch (e) {
    console.error("Error en getGenresMap:", e.message);
    return {};
  }
};

// ===============================
// Importar datos
// ===============================
const importData = async () => {
  if (!API_KEY || !MONGO_URI) {
    console.error("Faltan variables de entorno TMDB_API_KEY o MONGO_URI");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB conectado para seed.");

    const genresMap = await getGenresMap();
    if (Object.keys(genresMap).length === 0) {
      console.error("No se cargaron géneros. Verificá TMDB_API_KEY.");
      await mongoose.connection.close();
      process.exit(1);
    }

    const tmdbRes = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`
    );
    if (!tmdbRes.ok) {
      const err = await tmdbRes.json().catch(() => ({}));
      console.error(
        "Error TMDB al obtener populares:",
        tmdbRes.status,
        err.status_message || tmdbRes.statusText
      );
      await mongoose.connection.close();
      process.exit(1);
    }

    const tmdbData = await tmdbRes.json();
    if (!tmdbData.results || tmdbData.results.length === 0) {
      console.log("No hay resultados desde TMDB.");
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`Procesando ${tmdbData.results.length} películas...`);
    const moviePromises = tmdbData.results.map((m) =>
      mapTmdbToMovieSchema(m, genresMap)
    );
    const finalMovies = await Promise.all(moviePromises);
    const validMovies = finalMovies.filter(Boolean);

    if (validMovies.length === 0) {
      console.log("No se generaron películas válidas para insertar.");
      await mongoose.connection.close();
      process.exit(0);
    }

    await Movie.deleteMany();
    const created = await Movie.insertMany(validMovies);
    console.log(`Seed completado: ${created.length} películas insertadas.`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error importando datos:", error.message || error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// ===============================
// Eliminar datos
// ===============================
const destroyData = async () => {
  try {
    if (!MONGO_URI) {
      console.error("Falta MONGO_URI en .env");
      process.exit(1);
    }
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await Movie.deleteMany();
    console.log("Películas eliminadas.");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error destruyendo datos:", error.message || error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// ===============================
// Ejecutar según argumento
// ===============================
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
