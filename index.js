require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const authRoutes = require("./routes/auth.routes");

const app = express();

// 📌 Middlewares
app.use(cors());
app.use(express.json());

// 📌 Rutas
app.use("/api/auth", authRoutes);

// 📌 Sincronizar Base de Datos con Sequelize
const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await sequelize.sync({ alter: false });
        console.log("Modelos sincronizados con la base de datos.");

        // 📌 Iniciar el servidor
        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error("Error al conectar con la base de datos:", error);
        process.exit(1);
    }
})();

