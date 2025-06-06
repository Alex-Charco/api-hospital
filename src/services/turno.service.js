const { Turno, Horario, Medico, Especialidad } = require("../models");
const { Op } = require("sequelize");
const errorMessages = require("../utils/error_messages");

// Obtener turnos según filtros opcionales
async function obtenerTurnos({ fecha = null, estado = "DISPONIBLE", fechaInicio = null, fechaFin = null } = {}) {
    try {
        const whereHorario = {};

        if (fecha) {
            whereHorario.fecha_horario = { [Op.eq]: new Date(fecha) };
        } else if (fechaInicio && fechaFin) {
            whereHorario.fecha_horario = { [Op.between]: [new Date(fechaInicio), new Date(fechaFin)] };
        } else {
            const today = new Date();
			today.setHours(0, 0, 0, 0);
			whereHorario.fecha_horario = { [Op.gte]: today };
        }

        const whereTurno = estado ? { estado } : {};

        const turnos = await Turno.findAll({
            where: whereTurno,
            include: [
                {
                    model: Horario,
                    as: "horario",
                    where: whereHorario,
                    include: [
                        {
                            model: Medico,
                            as: "medico",
                            attributes: ['id_medico', 'identificacion', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo'],
                            include: [
                                {
                                    model: Especialidad,
                                    as: "especialidad",
                                    attributes: ['id_especialidad', 'nombre', 'atencion', 'consultorio']
                                }
                            ],
                        },
                    ],
                },
            ],
        });

        if (!turnos || turnos.length === 0) {
            return { message: errorMessages.errorTurnoNoDisponible, turnos: [] };
        }

        return turnos.map(formatTurnoData);
    } catch (error) {
        console.error("❌ Error en obtenerTurnos:", error);
        throw new Error(errorMessages.errorServidor);
    }
}

// Formatear datos del turno para la respuesta
function formatTurnoData(turno) {
    return {
        id_turno: turno.id_turno,
        fecha: turno.horario.fecha_horario,
        hora: turno.hora_turno,
        numero_turno: turno.numero_turno,
        estado: turno.estado,
        medico: {
            id_medico: turno.horario.medico.id_medico,
            identificacion: turno.horario.medico.identificacion,
            medico: turno.horario.medico
                ? `${turno.horario.medico.primer_nombre || ''} ${turno.horario.medico.segundo_nombre || ''} ${turno.horario.medico.primer_apellido || ''} ${turno.horario.medico.segundo_apellido || ''}`.trim()
                : null,
            correo: turno.horario.medico.correo,
            Especialidad: {
                especialidad: turno.horario.medico.especialidad.nombre,
                atencion: turno.horario.medico.especialidad.atencion,
                consultorio: turno.horario.medico.especialidad.consultorio,
            }
        },
    };
}

// Obtener todos los turnos DISPONIBLES sin filtros
async function obtenerTurnosDisponibles() {
    try {
        const turnos = await Turno.findAll({
            where: { estado: 'DISPONIBLE' },
            include: [
                {
                    model: Horario,
                    as: 'horario',
                    include: [
                        {
                            model: Medico,
                            as: 'medico',
                            attributes: ['id_medico', 'identificacion', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo'],
                            include: [
                                {
                                    model: Especialidad,
                                    as: 'especialidad',
                                    attributes: ['id_especialidad', 'nombre', 'atencion', 'consultorio']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!turnos || turnos.length === 0) {
            return { message: 'No hay turnos disponibles', turnos: [] };
        }

        return turnos.map(formatTurnoData);
    } catch (error) {
        console.error("❌ Error en obtenerTurnosDisponibles:", error);
        throw new Error(errorMessages.errorServidor);
    }
}


module.exports = { obtenerTurnos, obtenerTurnosDisponibles };
