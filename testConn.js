require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ CONEXIÓN EXITOSA A MONGODB");
    process.exit(0);
  })
  .catch((err) => {
    console.log("❌ ERROR DE CONEXIÓN");
    console.error(err.message);
    process.exit(1);
  });
