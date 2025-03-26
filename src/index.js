require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const pacienteRoutes = require('./routes/paciente.routes');
const infoMilitarRoutes = require('./routes/info_militar.routes');
const familiarRoutes = require('./routes/familiar.routes');
const residenciaRoutes = require("./routes/residencia.routes");
const seguroRoutes = require("./routes/seguro.routes");
const horarioRoutes = require("./routes/horario.routes");
const citaRoutes = require("./routes/cita.routes");
const turnoRoutes = require("./routes/turno.routes");
const medicoRoutes = require("./routes/medico.routes");
const notaEvolutivaRoutes = require("./routes/nota_evolutiva.routes");
const recetaRoutes = require("./routes/receta.routes");
const recetaAutorizacionRoutes = require("./routes/receta_autorizacion.routes");
const personaExternaRoutes = require("./routes/persona_externa.routes");

/*const corsOptions = {
    origin: 'http://localhost:3000'
};*/

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,  // Permite cookies/sesiones
    optionsSuccessStatus: 200 // Para navegadores antiguos
};


const app = express();

// Deshabilitar la cabecera "x-powered-by"
app.disable("x-powered-by");

// 📌 Middlewares
app.use(cors(corsOptions));
// Funciona con app web
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// No usar en producción, pero con app web no funciona
//app.use(cors({ origin: "*", credentials: true }));

app.use(express.json());

// 📌 Rutas
app.use("/api/auth", authRoutes);
app.use('/api/paciente', pacienteRoutes);
app.use('/api/info-militar', infoMilitarRoutes);
app.use('/api/familiar', familiarRoutes);
app.use('/api/residencia', residenciaRoutes);
app.use('/api/seguro', seguroRoutes);
app.use('/api/horario', horarioRoutes);
app.use('/api/cita', citaRoutes);
app.use('/api/turno', turnoRoutes);
app.use('/api/medico', medicoRoutes);
app.use('/api/nota-evolutiva', notaEvolutivaRoutes);
app.use('/api/receta', recetaRoutes);
app.use('/api/receta-autorizacion', recetaAutorizacionRoutes);
app.use('/api/persona-externa', personaExternaRoutes);

// 📌 Sincronizar Base de Datos con Sequelize
const PORT = process.env.PORT || 5000;

(async () => {
    try {
        // Sincronización de la BD con la opción { alter: true } evita índices duplicados
        await sequelize.sync({ force: false, alter: false });
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
