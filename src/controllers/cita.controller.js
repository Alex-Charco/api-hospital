const citaService = require('../services/cita.service');
const { formatFechaCompleta } = require('../utils/date_utils');
const errorMessages = require("../utils/error_messages");
const successMessages = require('../utils/success_messages');


async function getCitas(req, res) {
    try {
        const { identificacionPaciente, identificacionMedico } = req.params; 
        const { fechaInicio, fechaFin, estadoCita } = req.query;

        if (!identificacionPaciente && !identificacionMedico) {
            return res.status(400).json({ message: errorMessages.identificacionRequerida });
        }

        console.log("📌 Solicitando citas para paciente: ", identificacionPaciente);
        console.log("📌 Solicitando citas para médico: ", identificacionMedico);
        console.log("📌 Fechas: ", { fechaInicio, fechaFin, estadoCita });

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
        console.error("❌ Error en getCita: ", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

/*async function getCita(req, res) {
    try {
        const { identificacionPaciente, identificacionMedico } = req.params; 
        const { fechaInicio, fechaFin, estadoCita } = req.query;

        if (!identificacionPaciente && !identificacionMedico) {
            return res.status(400).json({ message: errorMessages.identificacionRequerida });
        }

        console.log("📌 Solicitando citas para paciente: ", identificacionPaciente);
        console.log("📌 Solicitando citas para médico: ", identificacionMedico);
        console.log("📌 Fechas: ", { fechaInicio, fechaFin, estadoCita });

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
        console.error("❌ Error en getCita: ", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}*/





const registrarCita = async (req, res) => {
    try {
        const { id_turno, id_paciente } = req.body;

        // Validar que id_turno e id_paciente sean proporcionados
        if (!id_turno || !id_paciente) {
            return res.status(400).json({ message: errorMessages.faltanDatosRequeridos });
        }

        // Llamar al servicio para registrar la cita
        const resultado = await citaService.crearCita(id_turno, id_paciente);

        // Verificar si la cita existe antes de intentar convertirla en JSON
        if (!resultado.cita) {
            return res.status(400).json({ message: errorMessages.errorCrearCita });
        }

        // Formatear la fecha antes de enviarla en la respuesta
        const citaFormateada = {
            ...resultado.cita.toJSON(),
            fecha_creacion: formatFechaCompleta(resultado.cita.fecha_creacion)
        };
        
        return res.status(201).json({
            message: successMessages.citaRegistrada,
            cita: citaFormateada,
            turno_actualizado: resultado.turno_actualizado,
            horario_actualizado: resultado.horario_actualizado
        });

    } catch (error) {
        console.error("❌ Error en registrarCita:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
};


module.exports = { getCitas, registrarCita };

