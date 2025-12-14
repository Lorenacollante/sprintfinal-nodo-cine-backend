const mongoose = require("mongoose");
const { RATINGS_LIST } = require("../utils/constants");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: [true, "El nombre del perfil es obligatorio"],
      trim: true,
    },

    avatar: {
      type: String,
      default: "/avatars/default.png",
    },

    maxAgeRating: {
      type: String,
      enum: RATINGS_LIST,
      default: "R",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
