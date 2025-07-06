const sequelize = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await sequelize.sync({ force: false, alter: false });
        console.log("Modelos sincronizados con la base de datos.");

        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error("Error al conectar con la base de datos:", error);
        process.exit(1);
    }
})();
