const { Cita, Turno, Horario, Medico, Especialidad, Paciente } = require('../models');
const errorMessages = require("../utils/error_messages");
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


// ?? Función generica para obtener citas con filtros personalizados
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

        // DEBUG: Verificar que condiciones se estan enviando a la consulta
        console.log("Condiciones de b��squeda:", condiciones);

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
        '$turno.horario.fecha_horario$': getTodayDate() // Filtra solo citas del dia actual
    });
}

// ? Función para obtener citas por rango de fechas y estado
async function obtenerCitasPorRango(whereConditions, fechaInicio, fechaFin, estado = null) {
    return obtenerCitas(whereConditions, fechaInicio, fechaFin, estado);
}

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
                        fecha_horario: sequelize.fn('CURDATE') // Citas del mismo día
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

            // Enviar email con la información de la cita
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
