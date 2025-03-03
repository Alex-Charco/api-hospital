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
