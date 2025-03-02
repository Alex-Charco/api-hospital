const { sequelize } = require('../models');
const { Horario, Turno } = require('../models');
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
async function validarHorarioNuevo(idMedico, fecha, hora_inicio, hora_fin) {
    if (!idMedico || !fecha || !hora_inicio || !hora_fin) {
        console.error("❌ Error: Falta uno o más parámetros:", { idMedico, fecha, hora_inicio, hora_fin });
        throw new Error("Faltan parámetros para registrar el horario.");
    }

    console.log("Valores recibidos:", { idMedico, fecha, hora_inicio, hora_fin });

    try {
        const query = `
            SELECT * FROM horario 
            WHERE id_medico = :idMedico
                AND fecha_horario = :fecha
                AND (
                    (hora_inicio BETWEEN :hora_inicio AND :hora_fin) OR
                    (hora_fin BETWEEN :hora_inicio AND :hora_fin) OR
                    (:hora_inicio BETWEEN hora_inicio AND hora_fin)
            );
        `;

        const result = await sequelize.query(query, {
            replacements: { idMedico, fecha, hora_inicio, hora_fin },
            type: sequelize.QueryTypes.SELECT,
        });

        if (result.length > 0) {

            throw new Error('El horario se solapa con otro turno ya registrado');
        }
    } catch (error) {
        console.error("❌ Error en validarHorarioNuevo:", error.message);
        throw new Error("Error al validar el horario: " + error.message);
    }

    return true;
}

// funciona trae los horarios desde la fecha actual a posterior
async function obtenerHorario(id_medico, incluirPasados = false) {
    // Obtener la fecha actual en formato 'YYYY-MM-DD'
    const fechaActualStr = new Date().toISOString().split("T")[0]; 
    // Convertir la cadena a un objeto Date
    const fechaActual = new Date(fechaActualStr);
    
    console.log("Fecha actual (string):", fechaActualStr);
    console.log("Fecha actual (Date object):", fechaActual);

    // Si no se incluye horarios pasados, filtrar solo horarios con fecha_horario >= fechaActual
    const whereCondition = incluirPasados
        ? { id_medico }
        : { id_medico, fecha_horario: { [Op.gte]: fechaActual } };

    console.log("Condición de búsqueda:", whereCondition);

    const horarios = await Horario.findAll({
        where: whereCondition,
        include: [{ model: Turno, as: 'turnos' }]
    });

    if (!horarios || horarios.length === 0) {
        throw new Error(errorMessages.horarioNoEncontrado);
    }

    return horarios;
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

    if (!horarios || horarios.length === 0) {
        throw new Error(errorMessages.horarioNoEncontrado);
    }

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

module.exports = {
    validarHorarioRegistrado,
    validarHorarioNuevo,
    obtenerHorario,
    buscarHorarioPorFecha,
    crearHorario
};
