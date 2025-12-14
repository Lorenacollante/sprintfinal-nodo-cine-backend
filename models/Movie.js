const mongoose = require("mongoose");
const { RATINGS_LIST } = require("../utils/constants");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    genres: {
      type: [String],
      required: [true, "Debe incluir al menos un género"],
    },

    year: {
      type: Number,
      required: [true, "El año es obligatorio"],
      min: 1888,
      max: new Date().getFullYear(),
    },

    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },

    ageRating: {
      type: String,
      enum: ["G", "PG", "PG-13", "R", "NC-17"],
      default: "PG-13",
    },

    posterUrl: {
      type: String,
      default: null,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v) || v.startsWith("/"),
        message:
          "posterUrl debe ser una URL válida o una ruta local que comience con /",
      },
    },

    image: {
      type: String,
      default: null,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v) || v.startsWith("/"),
        message:
          "image debe ser una URL válida o una ruta local que comience con /",
      },
    },

    trailerUrl: {
      type: String,
      default: null,
    },

    externalId: {
      type: String,
      default: null,
    },
    trailerUrl: String,
    isKidFriendly: Boolean,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
