const express = require("express");
const axios = require("axios");
const router = express.Router();

// Endpoint para obtener trailers de una película por ID de TMDb
router.get("/trailer/:tmdbId", async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}/videos`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error al obtener datos de TMDb" });
  }
});

module.exports = router;
