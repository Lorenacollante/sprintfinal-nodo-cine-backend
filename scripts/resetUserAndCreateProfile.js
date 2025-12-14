const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Profile = require("../models/Profile");

const MONGO_URI = process.env.MONGO_URI;

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB conectado.");

    const userEmail = "admin@lucero.com";
    const newPassword = "admin123";

    // 1️⃣ Crear usuario si no existe
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = new User({
        email: userEmail,
        password: await bcrypt.hash(newPassword, 10),
        role: "owner",
        isKid: false,
      });
      await user.save();
      console.log(`Usuario creado: ${userEmail} con contraseña ${newPassword}`);
    } else {
      // Reseteamos la contraseña si ya existe
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      console.log(
        `Contraseña del usuario ${userEmail} reseteada a: ${newPassword}`
      );
    }

    // 2️⃣ Crear perfil "Adulto" si no existe
    let profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      profile = new Profile({
        name: "Adulto",
        type: "adult",
        user: user._id,
      });
      await profile.save();
      console.log("Perfil creado con éxito:", profile.name);
    } else {
      console.log("Perfil ya existe para este usuario:", profile.name);
    }

    mongoose.disconnect();
    console.log("Proceso completado.");
  } catch (err) {
    console.error("Error:", err);
    mongoose.disconnect();
  }
}

main();
