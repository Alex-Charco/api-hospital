const express = require("express");
const cors = require("cors");
require("dotenv").config();

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
const passwordRoutes = require("./routes/password.routes");
const asistenciaRoutes = require("./routes/asistencia.routes");

const app = express();
app.disable("x-powered-by");

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas
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
app.use('/auth/', passwordRoutes);
app.use('/api/asistencia/', asistenciaRoutes);

module.exports = app;
