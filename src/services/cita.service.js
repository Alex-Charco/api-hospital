const { Cita, Turno, Horario, Medico, Especialidad, Paciente } = require('../models');
const errorMessages = require("../utils/error_messages");
const { formatCompleta, formatFecha } = require('../utils/date_utils');
const { Op } = require('sequelize');

async function obtenerCitas({ identificacionPaciente, identificacionMedico, fechaInicio, fechaFin, estadoCita }) {
    try {
        let whereConditions = {};

        // Buscar paciente por identificación
        if (identificacionPaciente) {
            const paciente = await Paciente.findOne({ where: { identificacion: identificacionPaciente } });
            if (!paciente) {
                throw new Error(errorMessages.pacienteNoEncontrado);
            }
            whereConditions.id_paciente = paciente.id_paciente;
        }

        let medico = null;
        // Buscar médico por identificación
        if (identificacionMedico) {
            medico = await Medico.findOne({ where: { identificacion: identificacionMedico } });
            if (!medico) {
                throw new Error(errorMessages.medicoNoEncontrado);
            }
        }

        // Filtro por estado de la cita si se proporciona
        if (estadoCita) {
            whereConditions.estado_cita = estadoCita;
        }

        // Filtro por fechas si se proporcionan
        let whereFecha = {};
        if (fechaInicio && fechaFin) {
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
                                            attributes: ['id_especialidad', 'nombre', 'atencion', 'consultorio'] 
                                        }
                                    ],
                                    ...(medico ? { where: { id_medico: medico.id_medico } } : {}) // 🔥 Corrección del filtro por médico
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

module.exports = { obtenerCitas };

