const citaService = require('../services/cita.service');
const { Medico, Paciente } = require('../models');
const { formatCompleta, formatFecha, formatFechaCompleta } = require('../utils/date_utils');
const errorMessages = require("../utils/error_messages");
const successMessages = require('../utils/success_messages');

// ✅ Controlador para obtener citas
async function getCitas(req, res) {
    try {
        const { identificacionPaciente, identificacionMedico, fechaInicio, fechaFin, estado } = req.query;
        let whereConditions = {};

        // 🔹 Buscar paciente si se envía su identificación
        if (req.params.identificacionPaciente) {
            const paciente = await Paciente.findOne({ where: { identificacion: req.params.identificacionPaciente } });
            if (!paciente) return res.status(404).json({ message: "Paciente no encontrado" });
            whereConditions.id_paciente = paciente.id_paciente;
        }

        // 🔹 Buscar médico si se envía su identificación
        if (identificacionMedico) {
            const medico = await Medico.findOne({ where: { identificacion: identificacionMedico } });
            if (!medico) return res.status(404).json({ message: "Médico no encontrado" });
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

        if (!citas || citas.length === 0) return res.status(404).json({ message: "No se encontraron citas" });

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
        res.status(500).json({ message: "Error al obtener citas: " + error.message });
    }
}



/*async function getCitas(req, res) {
    try {
        const { identificacionPaciente, identificacionMedico, fechaInicio, fechaFin, estado } = req.query;

        let whereConditions = {};

        // 🔹 Buscar paciente si se envía su identificación
        if (identificacionPaciente) {
            const paciente = await Paciente.findOne({ where: { identificacion: identificacionPaciente } });
            if (!paciente) return res.status(404).json({ message: "Paciente no encontrado" });
            whereConditions.id_paciente = paciente.id_paciente;
        }

        // 🔹 Buscar médico si se envía su identificación
        if (identificacionMedico) {
            const medico = await Medico.findOne({ where: { identificacion: identificacionMedico } });
            if (!medico) return res.status(404).json({ message: "Médico no encontrado" });
            whereConditions['$turno.horario.medico.id_medico$'] = medico.id_medico;
        }

        // 🔹 Filtrar por estado de la cita
        if (estado) {
            whereConditions.estado_cita = estado;
        }

        let citas;

        // 📌 Si el usuario envía fechas, usamos la función de rango
        if (fechaInicio && fechaFin) {
            citas = await citaService.obtenerCitasPorRango(whereConditions, fechaInicio, fechaFin);
        } else {
            // 📌 Si no envía fechas, obtenemos solo las citas de hoy
            citas = await citaService.obtenerCitasDelDiaActual(whereConditions);
        }

        if (!citas) return res.status(404).json({ message: "No se encontraron citas" });

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
        res.status(500).json({ message: "Error al obtener citas: " + error.message });
    }
}
*/

// un solo filtrado
/*async function getCitas(req, res) {
    try {
		 console.log("📌 Parámetros recibidos en getCitas:", req.params);
        const { identificacionPaciente, identificacionMedico } = req.params; 
        const { fechaInicio, fechaFin, estadoCita } = req.query;
		
		// 📌 Validación: solo debe haber un parámetro
        if (identificacionPaciente && identificacionMedico) {
            return res.status(400).json({ message: "Solo se puede buscar por paciente o médico, no ambos." });
        }

        if (!identificacionPaciente && !identificacionMedico) {
            return res.status(400).json({ message: errorMessages.identificacionRequerida });
        }

        console.log("📌 Solicitando citas para paciente: ", identificacionPaciente);
        console.log("📌 Solicitando citas para médico: ", identificacionMedico);
        console.log("📌 Fechas: ", { fechaInicio, fechaFin, estadoCita });
		
		console.log("🔍 Identificación Paciente:", identificacionPaciente);
		console.log("🔍 Identificación Médico:", identificacionMedico);
		console.log("🔍 Rango de fechas:", fechaInicio, fechaFin);
		console.log("🔍 Estado de la cita:", estadoCita);


        // Llamamos a obtenerCitas pasando los parámetros necesarios
        const citas = await citaService.obtenerCitas({
            identificacionPaciente,
            identificacionMedico,
            fechaInicio,
            fechaFin,
            estadoCita
        });
		

        if (!citas || citas.length === 0) {
            return res.status(404).json({ message: errorMessages.citasNoEncontradas });
        }

        return res.status(200).json(citas);
    } catch (error) {
        console.error("❌ Error en getCita: ", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}
*/
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

