const { sequelize } = require("../models");
const notaEvolutivaService = require("../services/nota_evolutiva.service");
const linkService = require("../services/link.service"); 
const errorMessages = require('../utils/error_messages');
const successMessages = require('../utils/success_messages');

// Registrar una nueva nota evolutiva con diagnóstico, procedimiento y link v2
async function registrarNotaEvolutiva(req, res) {
    const { id_cita, motivo_consulta, diagnosticos, procedimientos, links, ...datosNotaEvolutiva } = req.body;

    if (!id_cita || !motivo_consulta) {
        return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const transaction = await sequelize.transaction();

    try {
        // Delegar toda la lógica a `crearNota`
        const resultado = await notaEvolutivaService.crearNota({
            id_cita,
            motivo_consulta,
            diagnosticos,
            procedimientos,
            links,
            ...datosNotaEvolutiva
        }, transaction);

        await transaction.commit();
        return res.status(201).json({ message: "Registro exitoso", ...resultado });

    } catch (error) {
        await transaction.rollback();
        console.error("❌ Error en registrarNotaEvolutiva:", error.message);
        return res.status(500).json({ message: error.message || "Error interno del servidor" });
    }
}

// Obtener nota evolutiva por ID de cita o identificación del paciente
async function obtenerNotaEvolutiva(req, res) {
    try {
        const { id_cita, identificacion } = req.query;

        if (!id_cita && !identificacion) {
            return res.status(400).json({ message: errorMessages.filtroRequerido });
        }

        // Obtener la nota evolutiva junto con diagnósticos, procedimientos y links
        const nota = await notaEvolutivaService.obtenerNotasDetalladas({ id_cita, identificacion });

        if (!nota || nota.length === 0) {
            return res.status(404).json({ message: errorMessages.notaNoEncontrada });
        }

        return res.status(200).json({ 
            message: successMessages.notaEncontrada, 
            nota
        });

    } catch (error) {
        console.error("❌ Error en obtenerNotaEvolutiva:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// Actualizar una nota evolutiva con diagnóstico, procedimiento y link
async function actualizarNotaEvolutiva(req, res) {
    try {
        const { id_nota_evolutiva } = req.params;
        const nuevosDatos = req.body;

        if (!id_nota_evolutiva) {
            return res.status(400).json({ message: errorMessages.idNotaRequerido });
        }

        const notaActualizada = await notaEvolutivaService.actualizarNota(id_nota_evolutiva, nuevosDatos);

        // ✅ Insertar nuevos links en paralelo
        if (nuevosDatos.links && Array.isArray(nuevosDatos.links)) {
            await Promise.all(nuevosDatos.links.map(async nuevoLink => {
                await linkService.crearLink({ id_nota_evolutiva, ...nuevoLink });
            }));
        }

        return res.status(200).json({
            message: successMessages.informacionActualizada,
            nota: notaActualizada
        });
    } catch (error) {
        console.error("\u274C Error en actualizarNotaEvolutiva:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = {
    registrarNotaEvolutiva,
    obtenerNotaEvolutiva,
    actualizarNotaEvolutiva
};