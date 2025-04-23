// controllers/cita.controller.js
const citaService = require('../services/cita.service');
const { Paciente, Usuario, Medico } = require('../models');
const { formatFecha, formatFechaCompleta } = require('../utils/date_utils');
const errorMessages = require("../utils/error_messages");
const successMessages = require('../utils/success_messages');

// Controlador para obtener citas de un paciente específico ok v1
/*async function getCitasPorPaciente(req, res) {
    try {
        const { identificacionPaciente } = req.params;  // Obtenemos la identificación del paciente de la URL
        const { fechaInicio, fechaFin, desdeHoy } = req.query; // Filtros de fecha opcionales

        // Buscar el paciente con la identificación proporcionada
        const paciente = await Paciente.findOne({ where: { identificacion: identificacionPaciente } });
        if (!paciente) return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });

        // Condiciones iniciales para la búsqueda de citas del paciente
        let whereConditions = { 'id_paciente': paciente.id_paciente };

        let citas;
        if (fechaInicio && fechaFin) {
            citas = await citaService.obtenerCitasPorRango(whereConditions, fechaInicio, fechaFin);
        } else if (desdeHoy === 'true') {
            citas = await citaService.obtenerCitasDesdeHoy(whereConditions);
        } else {
            citas = await citaService.obtenerCitasDelDiaActual(whereConditions);
        }

        if (!citas || citas.length === 0) return res.status(404).json({ message: errorMessages.citasNoEncontradas });

        // Obtener los datos del paciente
        const pacienteData = {
            id_paciente: paciente.id_paciente,
            identificacion: paciente.identificacion,
            nombre: [paciente.primer_nombre, paciente.segundo_nombre, paciente.primer_apellido, paciente.segundo_apellido]
                .filter(Boolean)
                .join(' '),
            correo: paciente.correo,
            edad: paciente.fecha_nacimiento ? citaService.getEdad(paciente.fecha_nacimiento) : null,
            grupo_etario: paciente.fecha_nacimiento
                ? citaService.getGrupoEtario(citaService.getEdad(paciente.fecha_nacimiento))
                : null
        };

        // Mapeamos las citas para formatear la respuesta
        res.json({
            paciente: pacienteData,
            citas: citas.map(cita => ({
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
            }))
        });
    } catch (error) {
        res.status(500).json({ message: errorMessages.errorObtenerCitas + error.message });
    }
}
*/

// Controlador para obtener citas de un paciente específico ok 
async function getCitasPorPaciente(req, res) {
    try {
        const { identificacionPaciente } = req.params;
        const { fechaInicio, fechaFin, desdeHoy } = req.query;

        const paciente = await Paciente.findOne({
		  where: { identificacion: identificacionPaciente },
		  include: [
			{
			  model: Usuario,
			  as: 'usuario',
			  attributes: ['nombre_usuario']
			}
		  ]
		});
        if (!paciente) return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });

        let whereConditions = { 'id_paciente': paciente.id_paciente };
        let citas;

        if (fechaInicio && fechaFin) {
            citas = await citaService.obtenerCitasPorRango(whereConditions, fechaInicio, fechaFin);
        } else if (desdeHoy === 'true') {
            citas = await citaService.obtenerCitasDesdeHoy(whereConditions);
        } else {
            citas = await citaService.obtenerCitasDelDiaActual(whereConditions);
        }

        if (!citas || citas.length === 0) return res.status(404).json({ message: errorMessages.citasNoEncontradas });

        const pacienteData = {
            id_paciente: paciente.id_paciente,
            identificacion: paciente.identificacion,
			nombre_usuario: paciente.usuario?.nombre_usuario || null,
            nombre: [paciente.primer_nombre, paciente.segundo_nombre, paciente.primer_apellido, paciente.segundo_apellido]
                .filter(Boolean)
                .join(' '),
            correo: paciente.correo,
            edad: paciente.fecha_nacimiento ? citaService.getEdad(paciente.fecha_nacimiento) : null,
            grupo_etario: paciente.fecha_nacimiento
                ? citaService.getGrupoEtario(citaService.getEdad(paciente.fecha_nacimiento))
                : null
        };

        res.json({
            paciente: pacienteData,
            citas: citas.map(cita => ({
                id_cita: cita.id_cita,
                estado_cita: cita.estado_cita,
                fecha_creacion: formatFechaCompleta(cita.fecha_creacion),
                turno: {
                    id_turno: cita.turno?.id_turno || null,
                    hora_turno: cita.turno?.hora_turno || null,
                    horario: {
                        id_horario: cita.turno?.horario?.id_horario || null,
                        fecha_horario: cita.turno?.horario?.fecha_horario ? formatFecha(cita.turno.horario.fecha_horario) : null
                    }
                },
                medico: cita.turno?.horario?.medico
                    ? {
                        id_medico: cita.turno.horario.medico.id_medico,
                        identificacion: cita.turno.horario.medico.identificacion,
                        nombre: [
                            cita.turno.horario.medico.primer_nombre,
                            cita.turno.horario.medico.segundo_nombre,
                            cita.turno.horario.medico.primer_apellido,
                            cita.turno.horario.medico.segundo_apellido
                        ]
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
        });

    } catch (error) {
        res.status(500).json({ message: errorMessages.errorObtenerCitas + error.message });
    }
}



// Controlador para obtener citas de un médico específico
async function getCitasPorMedico(req, res) {
    try {
        const { identificacionMedico } = req.params;
        const { fechaInicio, fechaFin, desdeHoy } = req.query;

        // Buscar al médico con la identificación proporcionada
        const medico = await Medico.findOne({
            where: { identificacion: identificacionMedico },
            include: ['especialidad']
        });

        if (!medico) return res.status(404).json({ message: errorMessages.medicoNoEncontrado });

        // Condiciones de búsqueda: citas asociadas al médico
        const whereConditions = {
            '$turno.horario.medico.id_medico$': medico.id_medico
        };

        let citas;
        if (fechaInicio && fechaFin) {
            citas = await citaService.obtenerCitasPorRango(whereConditions, fechaInicio, fechaFin);
        } else if (desdeHoy === 'true') {
            citas = await citaService.obtenerCitasDesdeHoy(whereConditions);
        } else {
            citas = await citaService.obtenerCitasDelDiaActual(whereConditions);
        }

        if (!citas || citas.length === 0) return res.status(404).json({ message: errorMessages.citasNoEncontradas });

        // Datos del médico
        const medicoData = {
            id_medico: medico.id_medico,
            identificacion: medico.identificacion,
            nombre: [medico.primer_nombre, medico.segundo_nombre, medico.primer_apellido, medico.segundo_apellido]
                .filter(Boolean)
                .join(' '),
            correo: medico.correo,
            especialidad: medico.especialidad?.nombre || null
        };

        // Respuesta
        res.json({
            medico: medicoData,
            citas: citas.map(cita => ({
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
                },
                paciente: {
                    id_paciente: cita.paciente?.id_paciente || null,
                    nombre: [cita.paciente?.primer_nombre, cita.paciente?.segundo_nombre, cita.paciente?.primer_apellido, cita.paciente?.segundo_apellido]
                        .filter(Boolean).join(' ')
                }
            }))
        });
    } catch (error) {
        res.status(500).json({ message: errorMessages.errorObtenerCitas + error.message });
    }
}



// ✅ Controlador para obtener citas v1 no
async function getCitas(req, res) {
    try {
        //const { identificacionPaciente, identificacionMedico, fechaInicio, fechaFin, estado } = req.query;
        const { identificacionPaciente, identificacionMedico, fechaInicio, fechaFin, estado, desdeHoy } = req.query;
		let whereConditions = {};

        // 🔹 Buscar paciente si se envía su identificación
        if (identificacionPaciente) {
            //const paciente = await Paciente.findOne({ where: { identificacion: req.params.identificacionPaciente } });
            const { identificacionPaciente, identificacionMedico, fechaInicio, fechaFin, estado } = req.query;
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
			citas = await citaService.obtenerCitasPorRango(whereConditions, fechaInicio, fechaFin, estado);
		} else if (desdeHoy === 'true') {
			citas = await citaService.obtenerCitasDesdeHoy(whereConditions, estado);
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
				correo: cita.paciente.correo,
				edad: cita.paciente.fecha_nacimiento ? citaService.getEdad(cita.paciente.fecha_nacimiento) : null,
				grupo_etario: cita.paciente.fecha_nacimiento
					? citaService.getGrupoEtario(citaService.getEdad(cita.paciente.fecha_nacimiento))
					: null
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

module.exports = { getCitas, registrarCita, getCitasPorPaciente, getCitasPorMedico };

