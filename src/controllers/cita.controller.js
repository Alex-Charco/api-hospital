const citaService = require('../services/cita.service');
const errorMessages = require("../utils/error_messages");

async function getCita(req, res) {
    try {
        const { identificacionPaciente, identificacionMedico } = req.params;  // Añadido identificacionMedico
        const { fechaInicio, fechaFin, estadoCita } = req.query;

        if (!identificacionPaciente && !identificacionMedico) {
            return res.status(400).json({ message: errorMessages.identificacionRequerida });
        }

        console.log("📌 Solicitando citas para paciente:", identificacionPaciente);
        console.log("📌 Solicitando citas para médico:", identificacionMedico);
        console.log("📌 Fechas:", { fechaInicio, fechaFin, estadoCita });

        // Llamamos a obtenerCitas pasando los parámetros necesarios
        const citas = await citaService.obtenerCitas({
            identificacionPaciente,
            identificacionMedico,
            fechaInicio,
            fechaFin,
            estadoCita
        });


        if (!citas || citas.length === 0) {
            return res.status(404).json({ message: errorMessages.citasNoEncontradas });
        }

        return res.status(200).json(citas);
    } catch (error) {
        console.error("❌ Error en getCita:", error);
        return res.status(500).json({ message: "Error interno al obtener las citas", error: error.message });
    }
}

// Controlador para registrar una cita
/*const registrarCita = async (req, res) => {
    const { id_turno, id_paciente } = req.body;

    // Validar que el turno_id y paciente_id sean proporcionados
    if (!id_turno|| !id_paciente) {
        return res.status(400).json({ message: 'Faltan datos: turno_id y paciente_id son requeridos.' });
    }

    try {
        // Llamar al servicio para registrar la cita
        const cita = await citaService.crearCita(id_turno, id_paciente);
        return res.status(201).json({
            message: 'Cita registrada exitosamente.',
            cita: cita
        });
    } catch (error) {
        // Manejar errores
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
*/
const registrarCita = async (req, res) => {
    try {
        const { id_turno, id_paciente } = req.body;

        // Validar que id_turno e id_paciente sean proporcionados
        if (!id_turno || !id_paciente) {
            return res.status(400).json({ message: 'Faltan datos: turno_id y paciente_id son requeridos.' });
        }

        // Llamar al servicio para registrar la cita
        const resultado = await citaService.crearCita(id_turno, id_paciente);
        
        return res.status(201).json({
            message: 'Cita registrada exitosamente.',
            cita: resultado.cita,
            turno_actualizado: resultado.turno_actualizado,
            horario_actualizado: resultado.horario_actualizado
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { getCita, registrarCita };

