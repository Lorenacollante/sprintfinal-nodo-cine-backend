const Profile = require("../models/Profile.js");
//const mongoose = require("mongoose");

// ===============================
// MANEJADOR DE ERRORES CENTRALIZADO
// ===============================
const handleError = (
  res,
  error,
  customMessage = "Error interno del servidor"
) => {
  console.error(`[Profile Controller Error] ${customMessage}:`, error.message);
  const status = error.status || 500;
  res.status(status).json({ message: customMessage });
};

// ====================================
// CRUD DE PERFILES
// ====================================

const getProfiles = async (req, res) => {
  try {
    // Usamos req.user._id si viene del JWT
    const profiles = await Profile.find({ user: req.user._id });
    res.json(profiles);
  } catch (error) {
    // Si hay un error, solo manejamos el error para esta función
    handleError(res, error, "Error al obtener perfiles");
  }
};
// 🛑 EL RESTO DE LAS FUNCIONES DEBEN IR AQUÍ, FUERA DE getProfiles

const createProfile = async (req, res) => {
  const { name, maxAgeRating } = req.body;

  try {
    const profileCount = await Profile.countDocuments({ user: req.user._id });
    if (profileCount >= 5) {
      return res
        .status(403)
        .json({ message: "Límite de 5 perfiles alcanzado." });
    }

    const newProfile = await Profile.create({
      name,
      maxAgeRating,
      user: req.user._id,
    });

    res.status(201).json(newProfile);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Datos de perfil no válidos.",
        details: error.message,
      });
    }
    handleError(res, error, "Error al crear perfil");
  }
};

const updateProfile = async (req, res) => {
  const { name, maxAgeRating } = req.body;

  try {
    const updatedProfile = await Profile.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, maxAgeRating },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res
        .status(404)
        .json({ message: "Perfil no encontrado o no autorizado." });
    }

    res.json(updatedProfile);
  } catch (error) {
    handleError(res, error, "Error al actualizar perfil");
  }
};

const deleteProfile = async (req, res) => {
  try {
    const deletedProfile = await Profile.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deletedProfile) {
      return res
        .status(404)
        .json({ message: "Perfil no encontrado o no autorizado." });
    }

    res.json({ message: "Perfil eliminado con éxito." });
  } catch (error) {
    handleError(res, error, "Error al eliminar perfil");
  }
};

module.exports = {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
};
