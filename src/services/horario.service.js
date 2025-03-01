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

// Obtener horario de un médico con los turnos asociados
/*async function obtenerHorario(id_medico) {
    const horario = await Horario.findAll({
        where: { id_medico },
        include: [{ model: Turno, as: 'turnos' }] 
    });

    if (!horario) {
        throw new Error(errorMessages.horarioNoEncontrado);
    }

    return horario;
}*/
// Obtener horarios de un médico con opción de filtrar por fecha

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

// nuevo con filtro tiene error
/*async function obtenerHorario(id_medico, incluirPasados = false) {
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); // Asegurar que la hora sea 00:00:00 para evitar problemas de comparación
    
    console.log("Fecha actual:", fechaActual);

    const whereCondition = incluirPasados
        ? { id_medico }
        : { 
            id_medico, 
            fecha_horario: { [Op.gte]: fechaActual }  // Comparar con un objeto Date
        };

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
*/

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

// Validar si el horario está reservado o asignado
async function validarHorarioReservadoOAsignado(id_horario) {
    try {
        // Verificar si el horario tiene turnos reservados
        const turnosReservados = await Turno.findAll({
            where: {
                id_horario,
                estado: 'RESERVADO' // Asegúrate de que el estado 'RESERVADO' coincida con el de la base de datos
            }
        });

        // Verificar si el horario está asignado
        const horario = await Horario.findOne({ where: { id_horario } });

        if (turnosReservados.length > 0) {
            throw new Error("No se puede actualizar el horario, ya que tiene turnos reservados.");
        }

        if (horario && horario.asignado === 1) {  // Asegúrate de que 'asignado' sea el campo adecuado
            throw new Error("No se puede actualizar el horario, ya que está asignado a otro turno.");
        }

    } catch (error) {
        console.error("❌ Error en validarHorarioReservadoOAsignado:", error.message);
        throw new Error("Error al validar si el horario está reservado o asignado.");
    }

    return true;
}

// Actualizar el horario de un médico
async function actualizarHorario(horario, nuevosDatos) {
    try {
        // Verificar si el horario está reservado o asignado
        await validarHorarioReservadoOAsignado(horario.id_horario);

        // Realizar la actualización del horario si las validaciones son correctas
        return await horario.update(nuevosDatos);
    } catch (error) {
        throw new Error(errorMessages.errorActualizarHorario + error.message);
    }
}


module.exports = {
    validarHorarioRegistrado,
    validarHorarioNuevo,
    obtenerHorario,
    buscarHorarioPorFecha,
    crearHorario,
    validarHorarioReservadoOAsignado,
    actualizarHorario,
};
