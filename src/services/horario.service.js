const { sequelize } = require('../models');
const { Horario, Turno, Medico, Especialidad } = require('../models');
const { Op } = require('sequelize');
const errorMessages = require("../utils/error_messages");

// Validar que el médico ya tiene un horario registrado
async function validarHorarioRegistrado(id_medico) {
    const horario = await Horario.findOne({ where: { id_medico } });
    if (horario) {
        throw new Error(errorMessages.horarioYaRegistrado);
    }
}

// Validar si el horario está solapado
async function validarHorarioNuevo(idMedico, fecha, hora_inicio, hora_fin, idHorarioIgnorar = null) {
    if (!idMedico || !fecha || !hora_inicio || !hora_fin) {
        throw new Error("Faltan parámetros para validar el horario.");
    }

    try {
        let query = `
            SELECT * FROM horario 
            WHERE id_medico = :idMedico
              AND fecha_horario = :fecha
              AND (
                  (hora_inicio BETWEEN :hora_inicio AND :hora_fin) OR
                  (hora_fin BETWEEN :hora_inicio AND :hora_fin) OR
                  (:hora_inicio BETWEEN hora_inicio AND hora_fin)
              )
        `;

        if (idHorarioIgnorar !== null) {
            query += ` AND id_horario != :idHorarioIgnorar`;
        }

        const result = await sequelize.query(query, {
            replacements: { idMedico, fecha, hora_inicio, hora_fin, idHorarioIgnorar },
            type: sequelize.QueryTypes.SELECT,
        });

        if (result.length > 0) {
            throw new Error('El horario se solapa con otro turno ya registrado');
        }
    } catch (error) {
        throw new Error("Error al validar el horario: " + error.message);
    }

    return true;
}

// funciona trae los horarios desde la fecha actual a posterior
async function obtenerHorario(id_medico, incluirPasados = false) {
    const fechaActualStr = new Date().toISOString().split("T")[0]; 
    const fechaActual = new Date(fechaActualStr);

    const whereCondition = incluirPasados
        ? { id_medico }
        : { id_medico, fecha_horario: { [Op.gte]: fechaActual } };

    const horarios = await Horario.findAll({
        where: whereCondition,
        include: [
            { model: Turno, as: 'turnos' }
        ],
        order: [['fecha_horario', 'ASC']] // opcional
    });

    if (!horarios || horarios.length === 0) {
		return {
			medico: await Medico.findOne({
				where: { id_medico },
				include: [{ model: Especialidad, as: "especialidad" }]
			}),
			horarios: [] // Devuelve un array vacío
		};
	}

    // Obtener una sola vez el médico (con especialidad)
    const medico = await Medico.findOne({
        where: { id_medico },
        include: [
            { model: Especialidad, as: "especialidad" }
        ]
    });

    if (!medico) {
        throw new Error("Médico no encontrado.");
    }

    return {
        medico,    // solo una vez
        horarios   // sin repetir el médico
    };
}

/**
 * Busca horarios por un rango de fechas o un horario específico.
 * @param {Object} filtros - Filtros opcionales (id_medico, fechaBusquedaInicio, fechaBusquedaFin, id_horario)
 */
async function buscarHorarioPorFecha({ id_medico, fechaBusquedaInicio, fechaBusquedaFin, id_horario }) {
    let whereCondition = {};

    if (id_horario) {
        whereCondition.id_horario = id_horario;
    } else {
        if (id_medico) whereCondition.id_medico = id_medico;
        if (fechaBusquedaInicio && fechaBusquedaFin) {
            whereCondition.fecha_horario = { [Op.between]: [fechaBusquedaInicio, fechaBusquedaFin] };
        }
    }

    console.log("Condición de búsqueda en buscarHorarioPorFecha:", whereCondition);

    const horarios = await Horario.findAll({
        where: whereCondition,
        include: [{ model: Turno, as: "turnos" }]
    });

    return horarios;
}

// Crear un nuevo horario
async function crearHorario(id_medico, datosHorario) {
    try {
        return await Horario.create({
            id_medico,
            ...datosHorario,
        });
    } catch (error) {
        throw new Error(errorMessages.errorCrearHorario + error.message);
    }
}

// Obtener horario por ID -- **Para editar** --
async function obtenerHorarioPorId(id_horario) {
    const horario = await Horario.findOne({
        where: { id_horario }
    });

    if (!horario) {
        throw new Error(errorMessages.horarioNoEncontrado);
    }

    return horario;
}

// Editar un horario existente
async function editarHorario(id_horario, datosHorario) {
    try {
        const horario = await Horario.findOne({ where: { id_horario } });

        if (!horario) {
            throw new Error(errorMessages.horarioNoEncontrado);
        }

        // Actualizamos el horario
        return await horario.update({
            ...datosHorario,
        });
    } catch (error) {
        throw new Error(errorMessages.errorEditarHorario + error.message);
    }
}

module.exports = {
    validarHorarioRegistrado,
    validarHorarioNuevo,
    obtenerHorario,
    buscarHorarioPorFecha,
    crearHorario,
	obtenerHorarioPorId,
    editarHorario
};
