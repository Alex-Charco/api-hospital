const notaEvolutivaService = require('../services/nota_evolutiva.service');
const errorMessages = require('../utils/error_messages');
const successMessages = require('../utils/success_messages');

// Registrar una nueva nota evolutiva
async function registrarNotaEvolutiva(req, res) {
    const { 
        id_cita, 
        motivo_consulta, 
        ...datosNotaEvolutiva
    } = req.body;

    try {
        if (!id_cita || !motivo_consulta) {
            return res.status(400).json({ message: errorMessages.faltanDatos });
        }

        // Obtener la cita y el id_paciente asociado
        const cita = await notaEvolutivaService.obtenerCitaPorId(id_cita);

        if (!cita) {
            return res.status(404).json({ message: errorMessages.citaNoEncontrada });
        }

        const { id_paciente } = cita;

        if (!id_paciente) {
            return res.status(400).json({ message: errorMessages.pacienteNoEncontrado });
        }

        // Registrar la nota evolutiva con id_paciente
        const nota = await notaEvolutivaService.crearNota({
            id_cita,
            id_paciente, // Agregamos el id_paciente
            motivo_consulta,
            ...datosNotaEvolutiva
        });

        return res.status(201).json({ message: successMessages.registroExitoso, nota });
    } catch (error) {
        console.error("❌ Error en registrarNotaEvolutiva:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}


// Obtener nota evolutiva por ID de cita o identificación del paciente
async function obtenerNotaEvolutiva(req, res) {
    try {
        const { id_cita, identificacion } = req.query;

        if (!id_cita && !identificacion) {
            return res.status(400).json({ message: errorMessages.filtroRequerido });
        }

        const nota = await notaEvolutivaService.obtenerNotas({ id_cita, identificacion });

        if (!nota) {
            return res.status(404).json({ message: errorMessages.notaNoEncontrada });
        }

        return res.status(200).json({ message: successMessages.notaEncontrada, nota });

    } catch (error) {
        console.error("❌ Error en obtenerNotaEvolutiva:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// Actualizar una nota evolutiva
async function actualizarNotaEvolutiva(req, res) {
    try {
        const { id_nota_evolutiva } = req.params;
        const nuevosDatos = req.body;

        if (!id_nota_evolutiva) {
            return res.status(400).json({ message: errorMessages.idNotaRequerido });
        }

        const notaActualizada = await notaEvolutivaService.actualizarNota(id_nota_evolutiva, nuevosDatos);

        return res.status(200).json({
            message: successMessages.informacionActualizada,
            nota: notaActualizada
        });

    } catch (error) {
        console.error("❌ Error en actualizarNotaEvolutiva:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = {
    registrarNotaEvolutiva,
    obtenerNotaEvolutiva,
    actualizarNotaEvolutiva
};