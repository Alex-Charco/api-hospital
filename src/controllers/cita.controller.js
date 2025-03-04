const citaService = require('../services/cita.service');
const errorMessages = require("../utils/error_messages");

async function getCita(req, res) {
    try {
        const { identificacionPaciente, identificacionMedico } = req.query; // Se obtienen de query en vez de params
        const { fechaInicio, fechaFin, estadoCita } = req.query;

        if (!identificacionPaciente && !identificacionMedico) {
            return res.status(400).json({ message: errorMessages.identificacionRequerida });
        }

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
        console.error("❌ Error en getCita:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.citasNoEncontradas });
    }
}


module.exports = {
    getCita
};



/*const citaService = require('../services/cita.service');
const errorMessages = require("../utils/error_messages");

async function getCita(req, res) {
    try {
        const { identificacion } = req.params;
        const { fechaInicio, fechaFin } = req.query;

        if (!identificacion) {
            return res.status(400).json({ message: errorMessages.identificacionRequerida });
        }

        // Llamamos al servicio para validar el paciente y obtener las citas
        const citas = await citaService.obtenerCitasPorPaciente(identificacion, fechaInicio, fechaFin);

        if (!citas || citas.length === 0) {
            return res.status(404).json({ message: errorMessages.citasNoEncontradas });
        }

        return res.status(200).json(citas);
    } catch (error) {
        console.error("❌ Error en getCita:", error);
        return res.status(500).json({ message: error?.message || errorMessages.errorServidor });
    }
}

module.exports = {
    getCita
};
*/



/*const citaService = require('../services/cita.service'); 
const infoMilitarService = require('../services/info_militar.service');
//const { formatFechaCompleta } = require('../utils/date_utils');
const errorMessages = require("../utils/error_messages");

async function getCita(req, res) {
    try {
        const { identificacion } = req.params;

        if (!identificacion) {
            return res.status(400).json({ message: errorMessages.identificacionRequerida });
        }

        // Validar que el paciente existe
        const paciente = await infoMilitarService.validarPacienteExistente(identificacion);
        
        if (!paciente) {
            return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });
        }

        // Obtener citas con datos relacionados
        const citas = await citaService.obtenerCitasPorPaciente(paciente.id_paciente);

        // Verificar si no hay citas
        if (!citas || citas.length === 0) {
            return res.status(404).json({ message: errorMessages.citasNoEncontradas });
        }


        return res.status(200).json(citas);
    } catch (error) {
        console.error("❌ Error en getCita:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = {
    getCita
};*/
