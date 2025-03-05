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


module.exports = { getCita };
