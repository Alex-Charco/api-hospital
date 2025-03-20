const citaService = require('../services/cita.service');
const { Medico, Paciente } = require('../models');
const { formatFecha, formatFechaCompleta } = require('../utils/date_utils');
const errorMessages = require("../utils/error_messages");
const successMessages = require('../utils/success_messages');

// ✅ Controlador para obtener citas
async function getCitas(req, res) {
    try {
        const { identificacionPaciente, identificacionMedico, fechaInicio, fechaFin, estado } = req.query;
        let whereConditions = {};

        // 🔹 Buscar paciente si se envía su identificación
        if (identificacionPaciente) {
            const paciente = await Paciente.findOne({ where: { identificacion: req.params.identificacionPaciente } });
            if (!paciente) return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });
            whereConditions.id_paciente = paciente.id_paciente;
        }

        // 🔹 Buscar médico si se envía su identificación
        if (identificacionMedico) {
            const medico = await Medico.findOne({ where: { identificacion: identificacionMedico } });
            if (!medico) return res.status(404).json({ message: errorMessages.medicoNoEncontrado });
            whereConditions['$turno.horario.medico.id_medico$'] = medico.id_medico;
        }

        // 🔹 Filtrar por estado de la cita
        if (estado) {
            whereConditions.estado_cita = estado;
        }

        let citas;
        if (fechaInicio && fechaFin) {
            citas = await citaService.obtenerCitasPorRango(whereConditions, fechaInicio, fechaFin);
        } else {
            citas = await citaService.obtenerCitasDelDiaActual(whereConditions);
        }

        if (!citas || citas.length === 0) return res.status(404).json({ message: errorMessages.citasNoEncontradas });

        res.json(
            citas.map(cita => ({
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
            }))
        );
    } catch (error) {
        res.status(500).json({ message: errorMessages.errorObtenerCitas + error.message });
    }
}

const registrarCita = async (req, res) => {
    try {
        const { id_turno, id_paciente } = req.body;

        // Validar que id_turno e id_paciente sean proporcionados
        if (!id_turno || !id_paciente) {
            return res.status(400).json({ message: errorMessages.faltanDatosRequeridos });
        }

        // Llamar al servicio para registrar la cita
        const resultado = await citaService.crearCita(id_turno, id_paciente);

        // Verificar si la cita existe antes de intentar convertirla en JSON
        if (!resultado.cita) {
            return res.status(400).json({ message: errorMessages.errorCrearCita });
        }

        // Formatear la fecha antes de enviarla en la respuesta
        const citaFormateada = {
            ...resultado.cita.toJSON(),
            fecha_creacion: formatFechaCompleta(resultado.cita.fecha_creacion)
        };
        
        return res.status(201).json({
            message: successMessages.citaRegistrada,
            cita: citaFormateada,
            turno_actualizado: resultado.turno_actualizado,
            horario_actualizado: resultado.horario_actualizado
        });

    } catch (error) {
        console.error("❌ Error en registrarCita:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
};

module.exports = { getCitas, registrarCita };

