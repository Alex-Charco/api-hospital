const { Cita, Turno, Horario, Medico, Especialidad, Paciente } = require('../models');
const errorMessages = require("../utils/error_messages");
const { formatCompleta, formatFecha } = require('../utils/date_utils');
const { Op } = require('sequelize');
const sequelize = require("../config/db");

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

        // Buscar médico por identificación
        if (identificacionMedico) {
            const medico = await Medico.findOne({ where: { identificacion: identificacionMedico } });
            if (!medico) {
                throw new Error(errorMessages.medicoNoEncontrado);
            }
            // Agregar condición para filtrar por id_medico en la relación de Turno -> Horario -> Medico
            whereConditions['$turno.horario.medico.id_medico$'] = medico.id_medico;
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
                                            attributes: ['id_especialidad', 'nombre', 'atencion', 'consultorio']
                                        }
                                    ],
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

        return citas.map(cita => {
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


const crearCita = async (id_turno, id_paciente) => {
    try {
        // Verificar si el turno está disponible
        const turno = await Turno.findOne({ where: { id_turno } });
        if (!turno || turno.estado !== 'DISPONIBLE') {
            throw new Error(errorMessages.errorTurnoNoDisponible);
        }

        // Validar que el paciente no tenga otra cita el mismo día
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

        // Aquí realizamos la lógica de la transacción directamente sin usar el procedimiento almacenado

        // Iniciar transacción manualmente
        const t = await sequelize.transaction();

        try {
            // Bloquear el turno para evitar otros cambios en la base de datos mientras se reserva
            await Turno.update({ estado: 'RESERVADO' }, { where: { id_turno }, transaction: t });

            // Insertar la cita
            const cita = await Cita.create(
                { id_turno, id_paciente, estado_cita: 'PENDIENTE', fecha_creacion: new Date() },
                { transaction: t }
            );

            // Confirmar la transacción
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
            // Si hay un error en la transacción, revertirla
            await t.rollback();
            throw new Error(error.message);
        }

    } catch (error) {
        throw new Error(error.message);
    }
};



module.exports = { obtenerCitas, crearCita };

/*const crearCita = async (id_turno, id_paciente) => {
    try {
        // 1️⃣ Verificar si el turno está disponible
        const turno = await Turno.findOne({ where: { id_turno } });
        if (!turno || turno.estado !== 'DISPONIBLE') {
            throw new Error('El turno no está disponible');
        }

        // 2️⃣ Crear la cita en la base de datos con estado "PENDIENTE"
        const nuevaCita = await Cita.create({
            id_paciente,
            id_turno,
            estado_cita: 'PENDIENTE',
            fecha_creacion: new Date()
        });

        // 3️⃣ Actualizar el estado del turno a RESERVADO
        await Turno.update({ estado: 'RESERVADO' }, { where: { id_turno } });

        // 4️⃣ Obtener el turno actualizado y el horario correspondiente
        const turnoActualizado = await Turno.findOne({ where: { id_turno } });
        const horarioActualizado = await Horario.findOne({ where: { id_horario: turnoActualizado.id_horario } });

        return { cita: nuevaCita, turno_actualizado: turnoActualizado, horario_actualizado: horarioActualizado };

    } catch (error) {
        throw new Error(error.message);
    }
};*/
