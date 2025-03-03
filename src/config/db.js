const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectModule: mysql2,
    logging: false,
  }
);

// 📌 Verificar la conexión
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a la base de datos exitosa.");
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
  }
})();

module.exports = sequelize;
