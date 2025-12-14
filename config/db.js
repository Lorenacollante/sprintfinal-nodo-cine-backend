const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // ✅ Confirmación inmediata y garantizada
    console.log("✅ MongoDB conectado correctamente");

    // ❌ Si se cae después, avisa
    mongoose.connection.on("error", (err) => {
      console.error("❌ Error MongoDB en ejecución:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB desconectado");
    });
  } catch (error) {
    console.error("❌ ERROR CRÍTICO AL INICIAR MONGODB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
