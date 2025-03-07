const { Turno, Horario, Medico, Especialidad } = require("../models");
const { Op } = require("sequelize");
const errorMessages = require("../utils/error_messages");

// Obtener turnos según filtros opcionales
async function obtenerTurnos({ fecha = null, estado = "DISPONIBLE" } = {}) {
    try {
        const whereHorario = {};
        if (fecha) {
            whereHorario.fecha_horario = { [Op.eq]: new Date(fecha) };
        } else {
            whereHorario.fecha_horario = { [Op.gte]: new Date().toISOString().split("T")[0] };
        }

        const turnos = await Turno.findAll({
            where: estado ? { estado } : {},
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
            //throw new Error(errorMessages.errorTurnoNoDisponible);
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

module.exports = { obtenerTurnos };








/*const { Turno, Horario, Medico, Especialidad } = require("../models");
const { Op } = require("sequelize");

// Obtener turnos disponibles (general o por fecha específica)
async function obtenerTurnos({ fecha = null } = {}) {

    try {
        console.log("📅 Fecha recibida:", fecha);
        console.log("📅 Filtrando turnos por fecha:", fecha);

        // Si no se pasa una fecha, usamos la fecha actual
        const condicionFecha = fecha 
            ? { fecha_horario: { [Op.eq]: fecha } }  // Compara la fecha exactamente
            : { fecha_horario: { [Op.gte]: new Date().toISOString().split("T")[0] } };

        // Buscar los turnos disponibles
        const turnos = await Turno.findAll({
            where: { estado: "DISPONIBLE" },
            include: [
                {
                    model: Horario,
                    as: "horario",
                    where: condicionFecha,  // Filtro por fecha
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

        // Si no hay turnos disponibles, lanzamos un error
        if (!turnos || turnos.length === 0) {
            throw new Error("No hay turnos disponibles para esta fecha");
        }

        // Si se encuentran turnos, se formatean y retornan
        return turnos.map(formatTurnoData);
    } catch (error) {
        console.error("❌ Error en obtenerTurnos:", error);  // Aquí mostrará más detalles del error
        throw error;
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

module.exports = { obtenerTurnos };
*/

//NO
/*const { Turno, Horario, Medico, Especialidad } = require("../models");
const { Op } = require("sequelize");
const errorMessages = require("../utils/error_messages");

// Obtener turnos disponibles (general o por fecha específica)
async function obtenerTurnos({ fecha = null } = {}) {
    const condicionFecha = fecha 
        ? { fecha_horario: fecha } 
        : { fecha_horario: { [Op.gte]: new Date().toISOString().split("T")[0] } };

    const turnos = await Turno.findAll({
        where: { estado: "DISPONIBLE" },
        include: [
            {
                model: Horario,
                as: "horario",
                where: condicionFecha,
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
        throw new Error(errorMessages.turnoNoDisponible);
    }

    return turnos.map(formatTurnoData);
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

module.exports = { obtenerTurnos };
*/




// **FUNCIONAN LAS 2 FUNCIONES CORRECTAMENTE
/*const { Turno, Horario, Medico, Especialidad } = require("../models");
const { Op } = require("sequelize");
const errorMessages = require("../utils/error_messages");

// Obtener turnos disponibles desde la fecha actual en adelante
async function obtenerTurnosDisponibles() {
    const fechaActual = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD

    const turnos = await Turno.findAll({
        where: { estado: "DISPONIBLE" },
        include: [
            {
                model: Horario,
                as: "horario",
                where: { fecha_horario: { [Op.gte]: fechaActual } },
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
                            }],
                    },
                ],
            },
        ],
    });

    if (!turnos || turnos.length === 0) {
        throw new Error(errorMessages.turnoNoDisponible);
    }

    return turnos.map(formatTurnoData);
}

// Obtener turnos disponibles por una fecha específica
async function obtenerTurnosPorFecha(fecha) {
    console.log("🔍 Fecha recibida:", fecha);

    if (!fecha) {
        throw new Error("La fecha es requerida.");
    }

    try {
        console.log("🔍 Fecha recibida:", fecha);
        console.log("🔍 Consultando en la BD...");
        const turnos = await Turno.findAll({
            where: { estado: "DISPONIBLE" },
            include: [
                {
                    model: Horario,
                    as: "horario",
                    where: {
                        fecha_horario: {
                            [Op.eq]: new Date(fecha), // Convertimos el string en un objeto Date
                        },
                    },
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
        console.log("🔍 Turnos encontrados:", JSON.stringify(turnos, null, 2));
        if (!turnos || turnos.length === 0) {
            throw new Error("No hay turnos disponibles para esta fecha.");
        }

        return turnos.map(formatTurnoData);

    } catch (error) {
        console.error("❌ Error en obtenerTurnosPorFecha:", error);
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
            medico: turno.horario.medico? `${turno.horario.medico.primer_nombre || ''} ${turno.horario.medico.segundo_nombre || ''} ${turno.horario.medico.primer_apellido || ''} ${turno.horario.medico.segundo_apellido || ''}`.trim() : null,
            correo: turno.horario.medico.correo,
            Especialidad: {
                especialidad: turno.horario.medico.especialidad.nombre,
                atencion: turno.horario.medico.especialidad.atencion,
                consultorio: turno.horario.medico.especialidad.consultorio,
            }
        },
    };
}

module.exports = { obtenerTurnosDisponibles, obtenerTurnosPorFecha };
*/


// NO
/*
async function obtenerTurnosDisponibles() {
    const fechaActual = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD

    const turnos = await Turno.findAll({
        where: { estado: "DISPONIBLE" },
        include: [
            {
                model: Horario,
                as: "horario",
                where: { fecha_horario: { [Op.gte]: fechaActual } },
                include: [
                    {
                        model: Medico,
                        as: "medico",
                        include: [{ model: Especialidad, as: "especialidad" }],
                    },
                ],
            },
        ],
    });

    if (!turnos || turnos.length === 0) {
        throw new Error(errorMessages.turnoNoDisponible);
    }

    return turnos.map(formatTurnoData);
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
            nombre: turno.horario.medico.nombre,
            correo: turno.horario.medico.correo,
            especialidad: turno.horario.medico.especialidad.nombre,
            atencion: turno.horario.institucion,
            consultorio: turno.horario.medico.consultorio,
        },
    };
}

    */

