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
        console.log("Identificación recibida en la ruta:", identificacion);
		const medico = await infoMedicoService.validarMedicoExistente(identificacion);
		console.log("Resultado de búsqueda del médico:", medico);

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

// Editar horario de un médico (solo administradores)
async function editarHorario(req, res) {
    const { id_horario } = req.params;
    const { id_medico, hora_inicio, hora_fin, fecha_horario, ...otrosDatos } = req.body;

    try {
        const horario = await horarioService.obtenerHorarioPorId(id_horario);
        if (!horario) {
            return res.status(404).json({ message: errorMessages.horarioNoEncontrado });
        }

        if (horario.asignado !== 0) {
            return res.status(400).json({ message: "El horario no puede ser editado porque ya está asignado." });
        }

        await horarioService.validarHorarioNuevo(
            id_medico,
            fecha_horario,
            hora_inicio,
            hora_fin,
            id_horario
        );

        const horarioEditado = await horarioService.editarHorario(id_horario, {
            hora_inicio,
            hora_fin,
            fecha_horario,
            id_medico,
            ...otrosDatos
        });

        const horarioFormateado = {
            ...horarioEditado.toJSON(),
            fecha_horario: formatFecha(horarioEditado.fecha_horario),
        };

        return res.status(200).json({
            message: successMessages.editarExitoso,
            horario: horarioFormateado
        });
    } catch (error) {
        console.error("❌ Error en editarHorario:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = { registrarHorario, getByHorario,  editarHorario };
