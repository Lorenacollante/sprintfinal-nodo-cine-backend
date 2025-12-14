const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");
const { protect, roleCheck } = require("../middleware/authMiddleware");

// ===============================
// RUTAS DE PERFILES
// ===============================

router
  .route("/")
  .get(protect, profileController.getProfiles)
  .post(protect, roleCheck(["owner"]), profileController.createProfile);

router
  .route("/:id")
  .put(protect, roleCheck(["owner"]), profileController.updateProfile)
  .delete(protect, roleCheck(["owner"]), profileController.deleteProfile);

module.exports = router;
