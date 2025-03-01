const horarioService = require('../services/horario.service');
const infoMedicoService = require('../services/medico.service');
const { formatFecha } = require('../utils/date_utils');
const errorMessages = require('../utils/error_messages');
const successMessages = require('../utils/success_messages');

// Registrar horario de un médico (solo administradores)
async function registrarHorario(req, res) {
    const { identificacion } = req.params;
    const { horario, hora_inicio, hora_fin, fecha_horario, ...otrosDatos } = req.body;

    try {
        // Validar que el médico existe
        const medico = await infoMedicoService.validarMedicoExistente(identificacion);
        if (!medico) {
            return res.status(404).json({ message: errorMessages.medicoNoEncontrado });
        }

        // Validar que no exista solapamiento de horarios
        await horarioService.validarHorarioNuevo(medico.id_medico, fecha_horario, hora_inicio, hora_fin);

        // Crear un nuevo horario
        const horarioNuevo = await horarioService.crearHorario(medico.id_medico, { horario, hora_inicio, hora_fin, fecha_horario, ...otrosDatos });

        // Formatear horario (utilizamos la nueva lógica para formatear el horario)
        const horarioFormateado = {
            ...horarioNuevo.toJSON(),
            fecha_horario: formatFecha(horarioNuevo.fecha_horario),

        };

        return res.status(201).json({
            message: successMessages.registroExitoso,
            horario: horarioFormateado
        });
    } catch (error) {
        console.error("❌ Error en registrarHorario:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// Obtener horario de un médico
/*async function getByHorario(req, res) {
    const { identificacion } = req.params;

    try {
        // Validar que el médico existe
        const medico = await infoMedicoService.validarMedicoExistente(identificacion);
        if (!medico) {
            return res.status(404).json({ message: errorMessages.medicoNoEncontrado });
        }

        // Obtener el horario del médico
        const horario = await horarioService.obtenerHorario(medico.id_medico);
        if (!horario) {
            return res.status(404).json({ message: errorMessages.horarioNoEncontrado });
        }

        return res.status(200).json(horario);
    } catch (error) {
        console.error("❌ Error en getByHorario:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}*/

// funciona pero solo devuelve de fecha actual a posterior
/*async function getByHorario(req, res) {
    const { identificacion } = req.params;  // Obtener la identificación del médico de los parámetros
    const { incluirPasados } = req.query; // Parámetro opcional en la URL

    try {
        // Validar que el médico existe y obtener su id_medico
        const medico = await infoMedicoService.validarMedicoExistente(identificacion);
        if (!medico) {
            return res.status(404).json({ message: errorMessages.medicoNoEncontrado });
        }

        // Obtener el horario del médico con el id_medico
        const horario = await horarioService.obtenerHorario(medico.id_medico, incluirPasados === "true");

        // Responder con el horario encontrado
        return res.status(200).json(horario);
    } catch (error) {
        console.error("❌ Error en getByHorario:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}*/

// nuevo filtra tiene error
/*async function getByHorario(req, res) {
    const { identificacion } = req.params;  // Obtener la identificación del médico de los parámetros
    const { incluirPasados } = req.query; // Parámetro opcional en la URL

    try {
        // Validar que el médico existe y obtener su id_medico
        const medico = await infoMedicoService.validarMedicoExistente(identificacion);
        if (!medico) {
            return res.status(404).json({ message: errorMessages.medicoNoEncontrado });
        }

        // Obtener el horario del médico con el id_medico
        const horario = await horarioService.obtenerHorario(medico.id_medico, incluirPasados === "true");

        // Responder con el horario encontrado
        return res.status(200).json(horario);
    } catch (error) {
        console.error("❌ Error en getByHorario:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}*/

// Devuelve de fecha actual a posterior, filtros específico, desde hasta tal fecha
async function getByHorario(req, res) {
    const { identificacion } = req.params;
    const { incluirPasados, fechaInicio, fechaFin, idHorario } = req.query;

    try {
        // Validar que el médico existe
        const medico = await infoMedicoService.validarMedicoExistente(identificacion);
        if (!medico) {
            return res.status(404).json({ message: errorMessages.medicoNoEncontrado });
        }

        let horario;
        if (fechaInicio || fechaFin || idHorario) {
            // Si se proporciona fechaInicio, fechaFin o idHorario, usar la función de filtrado
            const filtros = {
                id_medico: medico.id_medico,
                fechaBusquedaInicio: fechaInicio,
                fechaBusquedaFin: fechaFin,
                id_horario: idHorario
            };
            horario = await horarioService.buscarHorarioPorFecha(filtros);
        } else {
            // Si no hay filtros, obtener horarios actuales y futuros
            horario = await horarioService.obtenerHorario(medico.id_medico, incluirPasados === "true");
        }

        return res.status(200).json(horario);
    } catch (error) {
        console.error("❌ Error en getByHorario:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}


// Actualizar horario de un médico (solo administradores)
async function actualizarHorario(req, res) {
    const { identificacion } = req.params;
    const nuevosDatos = req.body;

    try {
        // Validar que el médico existe
        const medico = await infoMedicoService.validarMedicoExistente(identificacion);
        if (!medico) {
            return res.status(404).json({ message: errorMessages.medicoNoEncontrado });
        }

        // Obtener el horario actual del médico
        const horario = await horarioService.obtenerHorario(medico.id_medico);
        if (!horario) {
            return res.status(404).json({ message: errorMessages.horarioNoEncontrado });
        }

        // Validar que no haya solapamiento de horarios
        await horarioService.validarHorarioNuevo(medico.id_medico, nuevosDatos.fecha_horario, nuevosDatos.hora_inicio, nuevosDatos.hora_fin);

        // Verificar si el horario está reservado o asignado
        await horarioService.validarHorarioReservadoOAsignado(horario.id_horario);

        // Actualizar el horario
        const horarioActualizado = await horarioService.actualizarHorario(horario, nuevosDatos);

        const horarioFormateado = {
            ...horarioActualizado.toJSON(),
            fecha_horario: formatFecha(horarioActualizado.fecha_horario),

        };

        return res.status(200).json({
            message: successMessages.informacionActualizada,
            horario: horarioFormateado
        });
    } catch (error) {
        console.error("❌ Error en actualizarHorario:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}


module.exports = { registrarHorario, getByHorario, actualizarHorario };
