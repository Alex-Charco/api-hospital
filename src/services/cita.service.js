const { Cita, Turno, Horario, Medico, Especialidad, Paciente } = require('../models');
const errorMessages = require("../utils/error_messages");
const { formatCompleta, formatFecha, formatFechaCompleta } = require('../utils/date_utils');
const sequelize = require("../config/db");
const { enviarCorreoConfirmacion } = require('./email.service');

const { Op } = require('sequelize');

// ?? Función para obtener la fecha actual en formato YYYY-MM-DD
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// ?? Función para obtener la fecha actual en formato YYYY-MM-DD
/*function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}
*/
// ?? Función genérica para obtener citas con filtros personalizados
async function obtenerCitas(whereConditions, fechaInicio = null, fechaFin = null, estado = null) {
    try {
        let condiciones = { ...whereConditions };

        // Agregar filtro por rango de fechas si se especifica
        if (fechaInicio && fechaFin) {
            condiciones['$turno.horario.fecha_horario$'] = { [Op.between]: [fechaInicio, fechaFin] };
        }

        // Agregar filtro por estado solo si la función recibe `estado`
        if (estado !== null) {
            condiciones['estado'] = estado;
        }

        // DEBUG: Verificar qué condiciones se están enviando a la consulta
        console.log("Condiciones de búsqueda:", condiciones);

        const citas = await Cita.findAll({
            where: condiciones,
            include: [
                {
                    model: Turno,
                    as: 'turno',
                    include: [
                        {
                            model: Horario,
                            as: 'horario',
                            include: [
                                {
                                    model: Medico,
                                    as: 'medico',
                                    include: [
                                        { model: Especialidad, as: 'especialidad' }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                { model: Paciente, as: 'paciente' }
            ]
        });

        return citas.length ? citas : [];
    } catch (error) {
        console.error("Error en obtenerCitas:", error);
        throw new Error("Error al obtener citas: " + error.message);
    }
}

// ? Función para obtener citas del día actual
async function obtenerCitasDelDiaActual(whereConditions) {
    return obtenerCitas({
        ...whereConditions,
        '$turno.horario.fecha_horario$': getTodayDate() // Filtra solo citas del día actual
    });
}

// ? Función para obtener citas por rango de fechas y estado
async function obtenerCitasPorRango(whereConditions, fechaInicio, fechaFin, estado = null) {
    return obtenerCitas(whereConditions, fechaInicio, fechaFin, estado);
}

// FUNCIONABA SIN ESTADO
// ? Función genérica para obtener citas con filtros personalizados
/*async function obtenerCitas(whereConditions, fechaInicio = null, fechaFin = null) {
    try {
        // Si se pasan fechas, agregarlas a las condiciones de filtrado
        if (fechaInicio && fechaFin) {
            whereConditions = {
                ...whereConditions,
                '$turno.horario.fecha_horario$': { [Op.between]: [fechaInicio, fechaFin] }
            };
        }

        const citas = await Cita.findAll({
            where: whereConditions,
            include: [
                {
                    model: Turno,
                    as: 'turno',
                    include: [
                        {
                            model: Horario,
                            as: 'horario',
                            include: [
                                {
                                    model: Medico,
                                    as: 'medico',
                                    include: [
                                        { model: Especialidad, as: 'especialidad' }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                { model: Paciente, as: 'paciente' }
            ]
        });

        return citas.length ? citas : null;
    } catch (error) {
        throw new Error("Error al obtener citas: " + error.message);
    }
}

// ? Función para obtener citas del día actual
async function obtenerCitasDelDiaActual(whereConditions) {
    return obtenerCitas({
        ...whereConditions,
        '$turno.horario.fecha_horario$': getTodayDate() // Filtra solo citas del día actual
    });
}

// ? Función para obtener citas por rango de fechas y estado
async function obtenerCitasPorRango(whereConditions, fechaInicio, fechaFin) {
    return obtenerCitas(whereConditions, fechaInicio, fechaFin);
}
*/

//funciona 
// ? Función para obtener citas del día actual
/*async function obtenerCitasDelDiaActual(whereConditions) {
    try {
        // Agregar la condición de fecha dentro de whereConditions
        whereConditions = {
            ...whereConditions,
            '$turno.horario.fecha_horario$': getTodayDate(), // ?? Filtra solo las citas del día actual
        };

        const citas = await Cita.findAll({
            where: whereConditions,
            include: [
                {
                    model: Turno,
                    as: 'turno',
                    include: [
                        {
                            model: Horario,
                            as: 'horario',
                            include: [
                                {
                                    model: Medico,
                                    as: 'medico',
                                    include: [
                                        { model: Especialidad, as: 'especialidad' }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                { model: Paciente, as: 'paciente' }
            ]
        });

        return citas.length ? citas : null;
    } catch (error) {
        throw new Error("Error al obtener citas del día actual: " + error.message);
    }
}

// ? Función para obtener citas por rango de fechas y estado
async function obtenerCitasPorRango(whereConditions, fechaInicio, fechaFin) {
    try {
        const citas = await Cita.findAll({
            where: whereConditions,
            include: [
                {
                    model: Turno,
                    as: 'turno',
                    include: [
                        {
                            model: Horario,
                            as: 'horario',
                            where: {
                                fecha_horario: { [Op.between]: [fechaInicio, fechaFin] } // ?? Filtra por fechas
                            },
                            include: [
                                {
                                    model: Medico,
                                    as: 'medico',
                                    include: [
                                        { model: Especialidad, as: 'especialidad' }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                { model: Paciente, as: 'paciente' }
            ]
        });

        return citas.length ? citas : null;
    } catch (error) {
        throw new Error("Error al obtener citas por rango de fechas: " + error.message);
    }
}
*/

// Función para obtener la fecha actual en formato YYYY-MM-DD
/*function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function obtenerCitas({ identificacionPaciente, identificacionMedico, fechaInicio, fechaFin, estadoCita }) {
    try {
        let whereConditions = {};

        if (identificacionPaciente) {
            const paciente = await Paciente.findOne({ where: { identificacion: identificacionPaciente } });
            if (!paciente) throw new Error(errorMessages.pacienteNoEncontrado);
            whereConditions.id_paciente = paciente.id_paciente;
        }

        if (identificacionMedico) {
            const medico = await Medico.findOne({
                where: { identificacion: identificacionMedico },
                include: [{ model: Horario, as: 'horarios', attributes: ['id_horario'] }]
            });
            if (!medico) throw new Error(errorMessages.medicoNoEncontrado);
            whereConditions['$turno.horario.medico.id_medico$'] = medico.id_medico;
        }

        if (estadoCita) whereConditions.estado_cita = estadoCita;

        // Obtener todas las citas sin filtrar la fecha en la consulta
        const citas = await Cita.findAll({
            where: whereConditions,
            attributes: ['id_cita', 'id_paciente', 'estado_cita', 'fecha_creacion'],
            include: [
                {
                    model: Turno,
                    as: 'turno',
                    attributes: ['id_turno', 'hora_turno', 'estado'],
                    include: [
                        {
                            model: Horario,
                            as: 'horario',
                            attributes: ['id_horario', 'fecha_horario'],
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
                },
                {
                    model: Paciente,
                    as: 'paciente',
                    attributes: ['id_paciente', 'identificacion', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo']
                }
            ]
        });

        if (!citas || citas.length === 0) throw new Error(errorMessages.citasNoEncontradas);

        // ?? **Filtrar las citas en memoria después de obtenerlas**
        const today = getTodayDate();
        const citasFiltradas = citas.filter(cita => {
            return cita.turno?.horario?.fecha_horario === today;
        });

        if (citasFiltradas.length === 0) throw new Error(errorMessages.citasNoEncontradas);

        return citasFiltradas.map(cita => ({
            cita: {
                id_cita: cita.id_cita,
                estado_cita: cita.estado_cita,
                fecha_creacion: formatFechaCompleta(cita.fecha_creacion),
                turno: {
                    id_turno: cita.turno?.id_turno || null,
                    hora_turno: cita.turno?.hora_turno || null,
                    horario: {
                        id_horario: cita.turno?.horario?.id_horario || null,
                        fecha_horario: cita.turno?.horario?.fecha_horario ? formatFecha(cita.turno.horario.fecha_horario) : null,
                    }
                }
            },
            paciente: {
                id_paciente: cita.paciente.id_paciente,
                identificacion: cita.paciente.identificacion,
                nombre: [cita.paciente.primer_nombre, cita.paciente.segundo_nombre, cita.paciente.primer_apellido, cita.paciente.segundo_apellido]
                    .filter(Boolean)
                    .join(' '),
                correo: cita.paciente.correo
            },
            medico: cita.turno?.horario?.medico
                ? {
                    id_medico: cita.turno.horario.medico.id_medico,
                    identificacion: cita.turno.horario.medico.identificacion,
                    nombre: [cita.turno.horario.medico.primer_nombre, cita.turno.horario.medico.segundo_nombre, cita.turno.horario.medico.primer_apellido, cita.turno.horario.medico.segundo_apellido]
                        .filter(Boolean)
                        .join(' '),
                    correo: cita.turno.horario.medico.correo,
                    especialidad: cita.turno.horario.medico.especialidad
                        ? {
                            id_especialidad: cita.turno.horario.medico.especialidad.id_especialidad,
                            nombre: cita.turno.horario.medico.especialidad.nombre,
                            atencion: cita.turno.horario.medico.especialidad.atencion,
                            consultorio: cita.turno.horario.medico.especialidad.consultorio
                        }
                        : null
                }
                : null
        }));
    } catch (error) {
        throw new Error(errorMessages.errorObtenerCitas + error.message);
    }
}
*/

/*async function obtenerCitas({ identificacionPaciente, identificacionMedico, fechaInicio, fechaFin, estadoCita }) {
    try {
        let whereConditions = {};
        const hoy = new Date().toISOString().split('T')[0]; // Obtener la fecha actual (YYYY-MM-DD)

        // ? Verificar paciente
        if (identificacionPaciente) {
            const paciente = await Paciente.findOne({ where: { identificacion: identificacionPaciente } });
            if (!paciente) {
                console.error("?? Paciente no encontrado:", identificacionPaciente);
                throw new Error(errorMessages.pacienteNoEncontrado);
            }
            whereConditions.id_paciente = paciente.id_paciente;
        }

        // ? Verificar médico
        if (identificacionMedico) {
            const medico = await Medico.findOne({ 
                where: { identificacion: identificacionMedico },
                include: [{ model: Horario, as: 'horarios', attributes: ['id_horario'] }]
            });
            if (!medico) {
                console.error("?? Médico no encontrado:", identificacionMedico);
                throw new Error(errorMessages.medicoNoEncontrado);
            }
            whereConditions['$turno.horario.medico.id_medico$'] = medico.id_medico;
        }

        // ? Filtro por estado de la cita (si se proporciona)
        if (estadoCita) {
            whereConditions.estado_cita = estadoCita;
        }

        // ?? Obtener citas con las relaciones necesarias
        const citas = await Cita.findAll({
            where: whereConditions,
            attributes: ['id_cita', 'id_paciente', 'estado_cita', 'fecha_creacion'],
            include: [
                {
                    model: Turno,
                    as: 'turno',
                    attributes: ['id_turno', 'hora_turno', 'estado'],
                    include: [
                        {
                            model: Horario,
                            as: 'horario',
                            attributes: ['id_horario', 'fecha_horario'],
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
                },
                {
                    model: Paciente,
                    as: 'paciente',
                    attributes: ['id_paciente', 'identificacion', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo']
                }
            ]
        });

        if (!citas || citas.length === 0) {
            console.error("?? No se encontraron citas con los parámetros proporcionados.");
            throw new Error(errorMessages.citasNoEncontradas);
        }

        // ? Filtrar citas por fecha si se proporciona un rango
        let citasFiltradas = citas;

        if (fechaInicio && fechaFin) {
            citasFiltradas = citas.filter(cita => {
                let fechaHorario = cita.turno?.horario?.fecha_horario;

                // ? Si la fecha_horario no es un objeto Date, convertimos a Date
                if (typeof fechaHorario === 'string') {
                    fechaHorario = new Date(fechaHorario);
                }

                // Verificar si fecha_horario es un objeto Date válido
                if (fechaHorario instanceof Date && !isNaN(fechaHorario.getTime())) {
                    // ? Convertimos las fechas a formato "YYYY-MM-DD"
                    const fechaHorarioStr = fechaHorario.toISOString().split('T')[0];

                    return fechaHorarioStr >= fechaInicio && fechaHorarioStr <= fechaFin;
                }

                return false;
            });
        }

        // ? Filtrar citas de hoy si no se ha proporcionado un rango de fechas
        if (!fechaInicio && !fechaFin) {
            citasFiltradas = citas.filter(cita => {
                let fechaHorario = cita.turno?.horario?.fecha_horario;

                // ? Convertir fecha_horario a un objeto Date si no lo es
                if (typeof fechaHorario === 'string') {
                    fechaHorario = new Date(fechaHorario);
                }

                // ? Asegurarse de que la fecha_horario sea un objeto Date válido
                if (fechaHorario instanceof Date && !isNaN(fechaHorario.getTime())) {
                    return fechaHorario.toISOString().split('T')[0] === hoy;
                }

                return false;
            });
        }

        // ? Retornar las citas filtradas
        return citasFiltradas.map(cita => {
            const medico = cita.turno?.horario?.medico;
            const especialidad = medico?.especialidad;
            const paciente = cita.paciente;

            return {
                cita: {
                    id_cita: cita.id_cita,
                    estado_cita: cita.estado_cita,
                    fecha_creacion: cita.fecha_creacion,
                    turno: {
                        id_turno: cita.turno?.id_turno || null,
                        hora_turno: cita.turno?.hora_turno || null,
                        horario: {
                            id_horario: cita.turno?.horario?.id_horario || null,
                            fecha_horario: cita.turno?.horario?.fecha_horario || null,
                        }
                    }
                },
                paciente: {
                    id_paciente: paciente.id_paciente,
                    identificacion: paciente.identificacion,
                    nombre: [paciente.primer_nombre, paciente.segundo_nombre, paciente.primer_apellido, paciente.segundo_apellido]
                        .filter(Boolean)
                        .join(' '),
                    correo: paciente?.correo || null,
                },
                medico: {
                    id_medico: medico?.id_medico || null,
                    identificacion: medico?.identificacion || null,
                    nombre: [medico?.primer_nombre, medico?.segundo_nombre, medico?.primer_apellido, medico?.segundo_apellido]
                        .filter(Boolean)
                        .join(' '),
                    correo: medico?.correo || null,
                    especialidad: especialidad ? {
                        id_especialidad: especialidad.id_especialidad,
                        nombre: especialidad.nombre,
                        atencion: especialidad.atencion,
                        consultorio: especialidad.consultorio
                    } : null
                }
            };
        });
    } catch (error) {
        console.error("?? Error al obtener las citas:", error);
        throw new Error(errorMessages.errorObtenerCitas + error.message);
    }
}
*/

// funcion pero no muestra las citas del dia
/*async function obtenerCitas({ identificacionPaciente, identificacionMedico, fechaInicio, fechaFin, estadoCita }) {
    try {
        let whereConditions = {};

        // ?? Verificar paciente
        if (identificacionPaciente) {
            const paciente = await Paciente.findOne({ where: { identificacion: identificacionPaciente } });
            if (!paciente) {
                console.error("?? Paciente no encontrado:", identificacionPaciente);
                throw new Error(errorMessages.pacienteNoEncontrado);
            }
            whereConditions.id_paciente = paciente.id_paciente;
        }

        // ?? Verificar médico
        if (identificacionMedico) {
            const medico = await Medico.findOne({ 
                where: { identificacion: identificacionMedico },
                include: [{ model: Horario, as: 'horarios', attributes: ['id_horario'] }]
            });
            if (!medico) {
                console.error("?? Médico no encontrado:", identificacionMedico);
                throw new Error(errorMessages.medicoNoEncontrado);
            }
            whereConditions['$turno.horario.medico.id_medico$'] = medico.id_medico;
        }

        // Filtro por estado de la cita
        if (estadoCita) {
            whereConditions.estado_cita = estadoCita;
        }

        const citas = await Cita.findAll({
            where: whereConditions,
            attributes: ['id_cita', 'id_paciente', 'estado_cita', 'fecha_creacion'],
            include: [
                {
                    model: Turno,
                    as: 'turno',
                    attributes: ['id_turno', 'hora_turno', 'estado'],
                    include: [
                        {
                            model: Horario,
                            as: 'horario',
                            attributes: ['id_horario', 'fecha_horario'],
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
                            ],
                            required: false
                        }
                    ]
                },
                {
                    model: Paciente,
                    as: 'paciente',
                    attributes: ['id_paciente', 'identificacion', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo']
                }
            ]
        });

        if (!citas || citas.length === 0) {
            throw new Error(errorMessages.citasNoEncontradas);
        }

        // **Corrección en el filtro de fechas**
        let citasFiltradas = citas;

        if (fechaInicio && fechaFin) {
            citasFiltradas = citas.filter(cita => {
                const fechaCita = cita.turno?.horario?.fecha_horario;
                return fechaCita && fechaCita >= fechaInicio && fechaCita <= fechaFin;
            });
        }

        // ? Si no se envían fechas, devolver TODAS las citas del paciente o médico
        // **ANTES solo devolvía las citas del día actual**
        // ? Eliminamos la restricción de que solo sean citas de hoy.

        return citasFiltradas.map(cita => {
            const medico = cita.turno?.horario?.medico;
            const especialidad = medico?.especialidad;
            const paciente = cita.paciente;

            return {
                cita: {
                    id_cita: cita.id_cita,
                    estado_cita: cita.estado_cita,
                    fecha_creacion: formatFechaCompleta(cita.fecha_creacion),
                    turno: {
                        id_turno: cita.turno?.id_turno || null,
                        hora_turno: cita.turno?.hora_turno || null,
                        horario: {
                            id_horario: cita.turno?.horario?.id_horario || null,
                            fecha_horario: cita.turno?.horario?.fecha_horario ? formatFechaCompleta(cita.turno.horario.fecha_horario) : null,
                        }
                    }
                },
                paciente: {
                    id_paciente: paciente.id_paciente,
                    identificacion: paciente.identificacion,
					nombre: paciente
                    ? [paciente.primer_nombre, paciente.segundo_nombre, paciente.primer_apellido, paciente.segundo_apellido]
                        .filter(Boolean) // Elimina valores nulos o undefined
                        .join(' ') // Une los nombres con un solo espacio
                    : "",	
                    correo: paciente?.correo || null,
                },
                medico: {
                    id_medico: medico?.id_medico || null,
                    identificacion: medico?.identificacion || null,
					nombre: medico
                    ? [medico.primer_nombre, medico.segundo_nombre, medico.primer_apellido, medico.segundo_apellido]
                        .filter(Boolean) // Elimina valores nulos o undefined
                        .join(' ') // Une los nombres con un solo espacio
                    : "",
                    correo: medico?.correo || null,
                    especialidad: especialidad ? {
                        id_especialidad: especialidad.id_especialidad,
                        nombre: especialidad.nombre,
                        atencion: especialidad.atencion,
                        consultorio: especialidad.consultorio
                    } : null
                }
            };
        });
    } catch (error) {
        throw new Error(errorMessages.errorObtenerCitas + error.message);
    }
}
*/

/*async function obtenerCitas({ identificacionPaciente, identificacionMedico, fechaInicio, fechaFin, estadoCita }) {
    try {
        let whereConditions = {};

        // ?? Verificar paciente
        if (identificacionPaciente) {
            const paciente = await Paciente.findOne({ where: { identificacion: identificacionPaciente } });
            if (!paciente) {
                console.error("?? Paciente no encontrado:", identificacionPaciente);
                throw new Error(errorMessages.pacienteNoEncontrado);
            }
            whereConditions.id_paciente = paciente.id_paciente;
        }

        // ?? Verificar médico
        if (identificacionMedico) {
            const medico = await Medico.findOne({ 
                where: { identificacion: identificacionMedico },
                include: [{ model: Horario, as: 'horarios', attributes: ['id_horario'] }]
            });
            if (!medico) {
                console.error("?? Médico no encontrado:", identificacionMedico);
                throw new Error(errorMessages.medicoNoEncontrado);
            }
            whereConditions['$turno.horario.medico.id_medico$'] = medico.id_medico;
        }


        // Filtro por estado de la cita
        if (estadoCita) {
            whereConditions.estado_cita = estadoCita;
        }

        const citas = await Cita.findAll({
            where: whereConditions,
            attributes: ['id_cita', 'id_paciente', 'estado_cita', 'fecha_creacion'],
            include: [
                {
                    model: Turno,
                    as: 'turno',
                    attributes: ['id_turno', 'hora_turno', 'estado'],
                    include: [
                        {
                            model: Horario,
                            as: 'horario',
                            attributes: ['id_horario', 'fecha_horario'],
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
                            ],
                            required: false
                        }
                    ]
                },
                {
                    model: Paciente,
                    as: 'paciente',
                    attributes: ['id_paciente', 'identificacion', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo']
                }
            ]
        });

        if (!citas || citas.length === 0) {
            throw new Error(errorMessages.citasNoEncontradas);
        }

        // **Determinar el rango de fechas**
        let citasFiltradas = citas;
        if (fechaInicio && fechaFin) {
            // Filtrar manualmente las citas dentro del rango de fechas
            citasFiltradas = citas.filter(cita => {
                const fechaCita = cita.turno?.horario?.fecha_horario;
                return fechaCita && fechaCita >= fechaInicio && fechaCita <= fechaFin;
            });
        } else if (!fechaInicio && !fechaFin && (identificacionPaciente || identificacionMedico)) {
            // Si solo hay identificaci贸n, obtener las citas del d铆a actual
            const hoy = new Date().toISOString().split('T')[0]; // Obtener la fecha en formato YYYY-MM-DD

            citasFiltradas = citas.filter(cita => {
                const fechaCita = cita.turno?.horario?.fecha_horario;
                return fechaCita && fechaCita.startsWith(hoy); // Comparar solo la fecha, ignorando la hora
            });
        }

        return citasFiltradas.map(cita => {
            const medico = cita.turno?.horario?.medico;
            const especialidad = medico?.especialidad;
            const paciente = cita.paciente;

            return {
                cita: {
                    id_cita: cita.id_cita,
                    estado_cita: cita.estado_cita,
                    fecha_creacion: formatCompleta(cita.fecha_creacion),
                    turno: {
                        id_turno: cita.turno?.id_turno || null,
                        hora_turno: cita.turno?.hora_turno || null,
                        horario: {
                            id_horario: cita.turno?.horario?.id_horario || null,
                            fecha_horario: cita.turno?.horario?.fecha_horario ? formatFecha(cita.turno.horario.fecha_horario) : null,
                        }
                    }
                },
                paciente: {
                    id_paciente: paciente.id_paciente,
                    identificacion: paciente.identificacion,
                    nombre: `${paciente.primer_nombre || ''} ${paciente.segundo_nombre || ''} ${paciente.primer_apellido || ''} ${paciente.segundo_apellido || ''}`.trim(),
                    correo: paciente?.correo || null,
                },
                medico: {
                    id_medico: medico?.id_medico || null,
                    identificacion: medico?.identificacion || null,
                    nombre: medico ? `${medico.primer_nombre || ''} ${medico.segundo_nombre || ''} ${medico.primer_apellido || ''} ${medico.segundo_apellido || ''}`.trim() : null,
                    correo: medico?.correo || null,
                    especialidad: especialidad ? {
                        id_especialidad: especialidad.id_especialidad,
                        nombre: especialidad.nombre,
                        atencion: especialidad.atencion,
                        consultorio: especialidad.consultorio
                    } : null
                }
            };
        });
    } catch (error) {
        throw new Error(errorMessages.errorObtenerCitas + error.message);
    }
}
*/
/*const crearCita = async (id_turno, id_paciente) => {
    try {
        // Verificar si el turno est谩 disponible
        const turno = await Turno.findOne({ where: { id_turno } });
        if (!turno || turno.estado !== 'DISPONIBLE') {
            throw new Error(errorMessages.errorTurnoNoDisponible);
        }

        // Validar que el paciente no tenga otra cita el mismo d铆a
        const citaExistente = await Cita.findOne({
            where: {
                id_paciente,
                estado_cita: 'PENDIENTE'
            },
            include: [{
                model: Turno,
                as: "turno",
                required: true,
                include: [{
                    model: Horario,
                    as: 'horario',
                    required: true,
                    where: {
                        fecha_horario: sequelize.fn('CURDATE') // Verificar la fecha del horario (no del turno)
                    }
                }]
            }]
        });

        if (citaExistente) {
            throw new Error(errorMessages.errorCitaAgendada);
        }

        // Aqu铆 realizamos la l贸gica de la transacci贸n directamente sin usar el procedimiento almacenado

        // Iniciar transacci贸n manualmente
        const t = await sequelize.transaction();

        try {
            // Bloquear el turno para evitar otros cambios en la base de datos mientras se reserva
            await Turno.update({ estado: 'RESERVADO' }, { where: { id_turno }, transaction: t });

            // Insertar la cita
            const cita = await Cita.create(
                { id_turno, id_paciente, estado_cita: 'PENDIENTE', fecha_creacion: new Date() },
                { transaction: t }
            );

            // Confirmar la transacci贸n
            await t.commit();

            // Obtener el turno y horario actualizados
            const turnoActualizado = await Turno.findOne({ where: { id_turno } });
            const horarioActualizado = await Horario.findOne({ where: { id_horario: turnoActualizado.id_horario } });

            // Verificar que la cita fue creada correctamente
            if (!cita) {
                throw new Error(errorMessages.huboErrorCrearCita);
            }

            return { 
                cita, 
                turno_actualizado: turnoActualizado, 
                horario_actualizado: horarioActualizado 
            };

        } catch (error) {
            // Si hay un error en la transacci贸n, revertirla
            await t.rollback();
            throw new Error(error.message);
        }

    } catch (error) {
        throw new Error(error.message);
    }
};*/

const crearCita = async (id_turno, id_paciente) => {
    try {
        const turno = await Turno.findOne({ where: { id_turno } });
        if (!turno || turno.estado !== 'DISPONIBLE') {
            throw new Error(errorMessages.errorTurnoNoDisponible);
        }

        // Validar si el paciente ya tiene una cita pendiente
        const citaExistente = await Cita.findOne({
            where: {
                id_paciente,
                estado_cita: 'PENDIENTE'
            },
            include: [{
                model: Turno,
                as: "turno",
                required: true,
                include: [{
                    model: Horario,
                    as: 'horario',
                    required: true,
                    where: {
                        fecha_horario: sequelize.fn('CURDATE') // Citas del mismo d铆a
                    }
                }]
            }]
        });

        if (citaExistente) {
            throw new Error(errorMessages.errorCitaAgendada);
        }

        const t = await sequelize.transaction();
        try {
            await Turno.update({ estado: 'RESERVADO' }, { where: { id_turno }, transaction: t });

            const cita = await Cita.create(
                { id_turno, id_paciente, estado_cita: 'PENDIENTE', fecha_creacion: new Date() },
                { transaction: t }
            );

            await t.commit();

            const citaCompleta = await Cita.findOne({
                where: { id_cita: cita.id_cita },
                include: [
                    {
                        model: Paciente,
                        as: 'paciente',
                        attributes: ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo']
                    },
                    {
                        model: Turno,
                        as: 'turno',
                        attributes: ['numero_turno', 'hora_turno'],
                        include: [{
                            model: Horario,
                            as: 'horario',
                            attributes: ['fecha_horario'],
                            include: [{
                                model: Medico,
                                as: 'medico',
                                attributes: ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo'],
                                include: [{
                                    model: Especialidad,
                                    as: 'especialidad',
                                    attributes: ['nombre', 'atencion', 'consultorio']
                                }]
                            }]
                        }]
                    }
                ]
            });

            if (!citaCompleta) {
                throw new Error(errorMessages.huboErrorCrearCita);
            }

            // Enviar email con la informaci贸n de la cita
            await enviarCorreoConfirmacion(citaCompleta);

            return { cita: citaCompleta };

        } catch (error) {
            await t.rollback();
            throw new Error(error.message);
        }

    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = { obtenerCitasDelDiaActual,
    obtenerCitasPorRango, crearCita };
