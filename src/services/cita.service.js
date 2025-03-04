const { Cita, Turno, Horario, Medico, Especialidad, Paciente } = require('../models');
const errorMessages = require("../utils/error_messages");
const { formatCompleta, formatFecha } = require('../utils/date_utils');
const { Op } = require('sequelize');

async function obtenerCitas({ identificacionPaciente, fechaInicio, fechaFin, estadoCita }) {
    try {
        if (!identificacionPaciente) {
            throw new Error(errorMessages.identificacionRequerida);
        }

        console.log("📌 Buscando citas para paciente:", identificacionPaciente);

        const paciente = await Paciente.findOne({ where: { identificacion: identificacionPaciente } });
        if (!paciente) {
            throw new Error(errorMessages.pacienteNoEncontrado);
        }

        let whereConditions = { id_paciente: paciente.id_paciente };
        
        if (estadoCita) {
            whereConditions.estado_cita = estadoCita;
        }

        let whereFecha = {};
        if (fechaInicio && fechaFin) {
            const fechaInicioValida = new Date(fechaInicio);
            const fechaFinValida = new Date(fechaFin);

            if (isNaN(fechaInicioValida.getTime()) || isNaN(fechaFinValida.getTime())) {
                throw new Error(errorMessages.fechaInvalida);
            }

            whereFecha.fecha_horario = { [Op.between]: [fechaInicio, fechaFin] };
        } else {
            const fechaActual = new Date().toISOString().split("T")[0];
            whereFecha.fecha_horario = { [Op.gte]: fechaActual };
        }

        const citas = await Cita.findAll({
            where: whereConditions,
            attributes: ['id_cita', 'estado_cita', 'fecha_creacion'],
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
                            //where: whereFecha,
                            include: [
                                {
                                    model: Medico,
                                    as: 'medico',
                                    attributes: ['id_medico', 'identificacion', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo'],
                                    include: [
                                        { 
                                            model: Especialidad, 
                                            as: 'especialidad', 
                                            attributes: ['id_especialidad', 'nombre', 'atencion', 'consultorio'] }]
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
            throw new Error(errorMessages.citasNoEncontradas);
        }

        return citas.map(cita => {
            const medico = cita.turno?.horario?.medico;
            const especialidad = medico?.especialidad;
            const paciente = cita.paciente;

            // Usamos la función formatFechaCompleta para formatear fecha_creacion y formatFecha para fecha_horario
            const fecha_creacion = formatCompleta(cita.fecha_creacion);  // Formato: YYYY-MM-DD HH:MM:SS
            const fecha_horario = cita.turno?.horario?.fecha_horario
                ? formatFecha(cita.turno.horario.fecha_horario)  // Formato: YYYY-MM-DD
                : null;
            const hora_turno = cita.turno?.hora_turno || null;

            return {
                cita: {
                    id_cita: cita.id_cita,
                    estado_cita: cita.estado_cita,
                    fecha_creacion,  // Usando la fecha convertida al formato completo
                    horario: {
                        fecha_horario,  // Usando la fecha convertida sin la hora
                        hora_turno
                    }
                },
                paciente: {
                    id_paciente: paciente.id_paciente,
                    identificacion: paciente.identificacion,
                    nombre: paciente
                        ? `${paciente.primer_nombre || ''} ${paciente.segundo_nombre || ''} ${paciente.primer_apellido || ''} ${paciente.segundo_apellido || ''}`.trim()
                        : null,
                    correo: paciente?.correo || null,
                },
                medico: {
                    id_medico: medico.id_medico,
                    identificacion: medico.identificacion,
                    nombre: medico
                        ? `${medico.primer_nombre || ''} ${medico.segundo_nombre || ''} ${medico.primer_apellido || ''} ${medico.segundo_apellido || ''}`.trim()
                        : null,
                    correo: medico?.correo || null,
                    especialidad: especialidad
                        ? {
                            id_especialidad: especialidad.id_especialidad,
                            nombre: especialidad.nombre,
                            atencion: especialidad.atencion,
                            consultorio: especialidad.consultorio
                        }
                        : null
                }
            };
        });
    } catch (error) {
        throw new Error(errorMessages.errorObtenerCitas + error.message);
    }
}

module.exports = { obtenerCitas };







/*const { Cita, Turno, Horario, Medico, Especialidad, Paciente } = require('../models');
const errorMessages = require("../utils/error_messages");
const { formatCompleta, formatFecha } = require('../utils/date_utils');
const { Op } = require('sequelize');

async function obtenerCitas({ identificacionPaciente, fechaInicio, fechaFin, estadoCita }) {
    try {
        if (!identificacionPaciente) {
            throw new Error(errorMessages.identificacionRequerida);
        }

        console.log("📌 Buscando citas para paciente:", identificacionPaciente);

        const paciente = await Paciente.findOne({ where: { identificacion: identificacionPaciente } });
        if (!paciente) {
            throw new Error(errorMessages.pacienteNoEncontrado);
        }

        let whereConditions = { id_paciente: paciente.id_paciente };
        
        if (estadoCita) {
            whereConditions.estado_cita = estadoCita;
        }

        let whereFecha = {};
        if (fechaInicio && fechaFin) {
            const fechaInicioValida = new Date(fechaInicio);
            const fechaFinValida = new Date(fechaFin);

            if (isNaN(fechaInicioValida.getTime()) || isNaN(fechaFinValida.getTime())) {
                throw new Error(errorMessages.fechaInvalida);
            }

            whereFecha.fecha_horario = { [Op.between]: [fechaInicio, fechaFin] };
        } else {
            const fechaActual = new Date().toISOString().split("T")[0];
            whereFecha.fecha_horario = { [Op.gte]: fechaActual };
        }

        const citas = await Cita.findAll({
            where: whereConditions,
            attributes: ['id_cita', 'estado_cita', 'fecha_creacion'],
            include: [
                {
                    model: Turno,
                    as: 'turno',
                    attributes: ['hora_turno', 'estado'],
                    include: [
                        {
                            model: Horario,
                            as: 'horario',
                            attributes: ['fecha_horario'],
                            where: whereFecha,
                            include: [
                                {
                                    model: Medico,
                                    as: 'medico',
                                    attributes: ['id_medico', 'identificacion', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo'],
                                    include: [
                                        { 
                                            model: Especialidad, 
                                            as: 'especialidad', 
                                            attributes: ['id_especialidad', 'nombre', 'atencion', 'consultorio'] }]
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
            throw new Error(errorMessages.citasNoEncontradas);
        }

        return citas.map(cita => {
            const medico = cita.turno?.horario?.medico;
            const especialidad = medico?.especialidad;
            const paciente = cita.paciente;

            return {
                cita: {
                    id_cita: cita.id_cita,
                    estado_cita: cita.estado_cita,
                    fecha_creacion: formatCompleta(cita.fecha_creacion),
                    horario: {
                        fecha_horario: cita.turno?.horario?.fecha_horario ? formatFecha(cita.turno.horario.fecha_horario) : null,
                        hora_turno: cita.turno?.hora_turno || null
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
                    especialidad: especialidad
                        ? {
                            id_especialidad: especialidad.id_especialidad,
                            nombre: especialidad.nombre,
                            atencion: especialidad.atencion,
                            consultorio: especialidad.consultorio
                        }
                        : null
                }
            };
        });
    } catch (error) {
        console.error("❌ Error en obtenerCitasPorPaciente:", error);
        throw new Error(errorMessages.errorObtenerCitas + (error.message || "Error desconocido"));
    }
}

module.exports = { obtenerCitas };
*/

/*const { Cita, Turno, Horario, Medico, Especialidad, Paciente } = require('../models');
const errorMessages = require("../utils/error_messages");
const { formatCompleta, formatFecha } = require('../utils/date_utils');
const { Op } = require('sequelize');
async function obtenerCitas({ identificacionPaciente, identificacionMedico, fechaInicio, fechaFin, estadoCita }) {
    try {
        let whereConditions = {};

        if (identificacionMedico) {
            const medico = await Medico.findOne({ where: { identificacion: identificacionMedico } });
            if (!medico) throw new Error(errorMessages.medicoNoEncontrado);
            whereConditions = { '$turno.horario.medico.identificacion$': identificacionMedico };
        } else if (identificacionPaciente) {
            const paciente = await Paciente.findOne({ where: { identificacion: identificacionPaciente } });
            if (!paciente) throw new Error(errorMessages.pacienteNoEncontrado);
            whereConditions['id_paciente'] = paciente.id_paciente;
        }

        if (estadoCita) {
            whereConditions.estado_cita = estadoCita;
        }

        if (fechaInicio && fechaFin) {
            whereConditions['$turno.horario.fecha_horario$'] = { [Op.between]: [fechaInicio, fechaFin] };
        } else {
            const fechaActual = new Date().toISOString().split("T")[0];
            whereConditions['$turno.horario.fecha_horario$'] = { [Op.gte]: fechaActual };
        }

        const citas = await Cita.findAll({
            where: whereConditions,
            attributes: ['id_cita', 'estado_cita', 'fecha_creacion'],
            include: [
                {
                    model: Turno,
                    as: 'turno',
                    attributes: ['hora_turno'],
                    include: [
                        {
                            model: Horario,
                            as: 'horario',
                            attributes: ['fecha_horario'],
                            include: [
                                {
                                    model: Medico,
                                    as: 'medico',
                                    attributes: ['identificacion', 'primer_nombre', 'primer_apellido', 'correo'],
                                    include: [{ model: Especialidad, as: 'especialidad', attributes: ['nombre'] }]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Paciente,
                    as: 'paciente',
                    attributes: ['identificacion', 'primer_nombre', 'primer_apellido', 'correo']
                }
            ]
        });

        if (!citas || citas.length === 0) throw new Error(errorMessages.citasNoEncontradas);

        return citas.map(cita => ({
            cita: {
                id_cita: cita.id_cita,
                estado_cita: cita.estado_cita,
                fecha_creacion: formatCompleta(cita.fecha_creacion),
                horario: {
                    fecha_horario: formatFecha(cita.turno?.horario?.fecha_horario),
                    hora_turno: cita.turno?.hora_turno
                }
            },
            paciente: cita.paciente ? {
                identificacion: cita.paciente.identificacion,
                nombre: `${cita.paciente.primer_nombre || ''} ${cita.paciente.primer_apellido || ''}`.trim(),
                correo: cita.paciente.correo
            } : null,
            medico: cita.turno?.horario?.medico ? {
                identificacion: cita.turno.horario.medico.identificacion,
                nombre: `${cita.turno.horario.medico.primer_nombre || ''} ${cita.turno.horario.medico.primer_apellido || ''}`.trim(),
                correo: cita.turno.horario.medico.correo,
                especialidad: cita.turno.horario.medico.especialidad?.nombre
            } : null
        }));
    } catch (error) {
        console.error("Error en obtenerCitas: ", error.message);
        throw new Error(errorMessages.errorObtenerCitas);
    }
}


module.exports = {
    obtenerCitas
};
*/




/*const { Cita, Turno, Horario, Medico, Especialidad, Paciente } = require('../models');
const errorMessages = require("../utils/error_messages");
const { formatCompleta, formatFecha } = require('../utils/date_utils');
const { Op } = require('sequelize');

async function obtenerCitasPorPaciente(identificacion, fechaInicio, fechaFin) {
    try {
        // Validar que el paciente existe
        const paciente = await Paciente.findOne({ where: { identificacion } });

        if (!paciente) {
            throw new Error(errorMessages.pacienteNoEncontrado);
        }

        console.log("📌 Buscando citas para paciente ID:", paciente.id_paciente);
        console.log("📌 Fecha Inicio:", fechaInicio, "Fecha Fin:", fechaFin);

        // Validar las fechas
        let whereFecha = {};
        if (fechaInicio && fechaFin) {
            // Validamos que las fechas tengan el formato correcto
            const fechaInicioValida = new Date(fechaInicio);
            const fechaFinValida = new Date(fechaFin);
            
            if (isNaN(fechaInicioValida.getTime()) || isNaN(fechaFinValida.getTime())) {
                throw new Error(errorMessages.fechaInvalida);
            }

            whereFecha.fecha_horario = { [Op.between]: [fechaInicio, fechaFin] };
        } else {
            const fechaActual = new Date().toISOString().split("T")[0];
            whereFecha.fecha_horario = { [Op.gte]: fechaActual }; // Citas desde hoy en adelante
        }

        const citas = await Cita.findAll({
            where: { id_paciente: paciente.id_paciente, estado_cita: 'PENDIENTE' },
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
                            where: whereFecha, 
                            include: [
                                {
                                    model: Medico,
                                    as: 'medico',
                                    attributes: ['id_medico', 'identificacion', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo'],
                                    include: [
                                        {
                                            model: Especialidad,
                                            as: 'especialidad',
                                            attributes: ['id_especialidad', 'nombre', 'atencion', 'consultorio'],
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
                    attributes: ['id_paciente', 'identificacion', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo'],
                }
            ]
        });

        if (!citas || citas.length === 0) {
            throw new Error(errorMessages.citasNoEncontradas);
        }

        return citas.map(cita => {
            const medico = cita.turno?.horario?.medico;
            const especialidad = medico?.especialidad;
            const paciente = cita.paciente;

            return {
                cita: {
                    id_cita: cita.id_cita,
                    estado_cita: cita.estado_cita,
                    fecha_creacion: formatCompleta(cita.fecha_creacion),
                    horario: {
                        fecha_horario: cita.turno?.horario?.fecha_horario ? formatFecha(cita.turno.horario.fecha_horario) : null,
                        hora_turno: cita.turno?.hora_turno || null
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
                    especialidad: especialidad
                        ? {
                            id_especialidad: especialidad.id_especialidad,
                            nombre: especialidad.nombre,
                            atencion: especialidad.atencion,
                            consultorio: especialidad.consultorio
                        }
                        : null
                }
            };
        });
    } catch (error) {
        console.error("❌ Error en obtenerCitasPorPaciente:", error);
        throw new Error(errorMessages.errorObtenerCitas + (error.message || "Error desconocido"));
    }
}

module.exports = {
    obtenerCitasPorPaciente
};
*/


/*
const { Cita, Turno, Horario, Medico, Especialidad, Paciente } = require('../models');
const errorMessages = require("../utils/error_messages");
const { formatCompleta, formatFecha } = require('../utils/date_utils');

async function obtenerCitasPorPaciente(id_paciente) {
    try {
        const citas = await Cita.findAll({
            where: { id_paciente },
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
                                    model: Medico, // Incluir al médico dentro del horario
                                    as: 'medico',
                                    attributes: ['id_medico', 'identificacion', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo'],
                                    include: [
                                        {
                                            model: Especialidad,
                                            as: 'especialidad',
                                            attributes: ['id_especialidad', 'nombre', 'atencion', 'consultorio'],
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
                    attributes: ['id_paciente', 'identificacion', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo'],
                }
            ]
        });
        

        if (!citas || citas.length === 0) {
            throw new Error(errorMessages.citasNoEncontradas);
        }

        return citas.map(cita => {
            const medico = cita.turno?.horario?.medico;
            const especialidad = medico?.especialidad;
            const paciente = cita.paciente;

            // Usamos la función formatFechaCompleta para formatear fecha_creacion y formatFecha para fecha_horario
            const fecha_creacion = formatCompleta(cita.fecha_creacion);  // Formato: YYYY-MM-DD HH:MM:SS
            const fecha_horario = cita.turno?.horario?.fecha_horario
                ? formatFecha(cita.turno.horario.fecha_horario)  // Formato: YYYY-MM-DD
                : null;
            const hora_turno = cita.turno?.hora_turno || null;

            return {
                cita: {
                    id_cita: cita.id_cita,
                    estado_cita: cita.estado_cita,
                    fecha_creacion,  // Usando la fecha convertida al formato completo
                    horario: {
                        fecha_horario,  // Usando la fecha convertida sin la hora
                        hora_turno
                    }
                },
                paciente: {
                    id_paciente: paciente.id_paciente,
                    identificacion: paciente.identificacion,
                    nombre: paciente
                        ? `${paciente.primer_nombre || ''} ${paciente.segundo_nombre || ''} ${paciente.primer_apellido || ''} ${paciente.segundo_apellido || ''}`.trim()
                        : null,
                    correo: paciente?.correo || null,
                },
                medico: {
                    id_medico: medico.id_medico,
                    identificacion: medico.identificacion,
                    nombre: medico
                        ? `${medico.primer_nombre || ''} ${medico.segundo_nombre || ''} ${medico.primer_apellido || ''} ${medico.segundo_apellido || ''}`.trim()
                        : null,
                    correo: medico?.correo || null,
                    especialidad: especialidad
                        ? {
                            id_especialidad: especialidad.id_especialidad,
                            nombre: especialidad.nombre,
                            atencion: especialidad.atencion,
                            consultorio: especialidad.consultorio
                        }
                        : null
                }
            };
        });
    } catch (error) {
        throw new Error(errorMessages.errorObtenerCitas + error.message);
    }
}

module.exports = {
    obtenerCitasPorPaciente
};
*/