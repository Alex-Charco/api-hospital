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
async function obtenerCitas(whereConditions, fechaInicio = null, fechaFin = null) {
    try {
        let condiciones = { ...whereConditions };

        // Agregar filtro por rango de fechas si se especifica
        if (fechaInicio && fechaFin) {
            condiciones['$turno.horario.fecha_horario$'] = { [Op.between]: [fechaInicio, fechaFin] };
        }

        // Obtener citas del paciente
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
				{
					model: Paciente,
					as: 'paciente'
				}
			]
		});


        return Array.isArray(citas) ? citas : [];
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

// Función para obtener citas desde hoy en adelante v2
async function obtenerCitasDesdeHoy(whereConditions) {
    const today = getTodayDate();
    return obtenerCitas({
        ...whereConditions,
        '$turno.horario.fecha_horario$': {
            [Op.gte]: today
        }
    });
}

// ? Función para obtener citas por rango de fechas
async function obtenerCitasPorRango(whereConditions, fechaInicio, fechaFin) {
    return obtenerCitas(whereConditions, fechaInicio, fechaFin);
}

// Función para calcular grupo_etario y fecha
function getEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    return edad;
}

function getGrupoEtario(edad) {
    if (edad >= 0 && edad <= 12) return 'Niño/a';
    if (edad >= 13 && edad <= 19) return 'Adolescente';
    if (edad >= 20 && edad <= 29) return 'Joven';
    if (edad >= 30 && edad <= 64) return 'Adulto';
    if (edad >= 65) return 'Adulto mayor';
    return 'Edad inválida';
}

const crearCita = async (id_turno, id_paciente) => {
    try {
        const turno = await Turno.findOne({
            where: { id_turno },
            include: [{
                model: Horario,
                as: 'horario',
                include: [{
                    model: Medico,
                    as: 'medico',
                    include: ['especialidad']
                }]
            }]
        });

        if (!turno || turno.estado !== 'DISPONIBLE') {
            throw new Error(errorMessages.errorTurnoNoDisponible);
        }

        const fechaCita = turno.horario.fecha_horario;

		// Obtener todas las citas del paciente para ese día
		const citasDelDia = await Cita.findAll({
			where: {
				id_paciente,
				estado_cita: 'PENDIENTE'
			},
			include: [{
				model: Turno,
				as: 'turno',
				include: [{
					model: Horario,
					as: 'horario',
					where: {
						fecha_horario: fechaCita
					},
					include: [{
						model: Medico,
						as: 'medico',
						include: ['especialidad']
					}]
				}]
			}]
		});

		// Verificar si ya hay  citas distintas
		if (citasDelDia.length >= 2) {
			throw new Error("El paciente ya tiene 2 citas registradas para ese día.");
		}

		// Verificar si ya existe una cita exacta igual (misma hora, médico y especialidad)
		const citaDuplicada = citasDelDia.find(c => {
			return (
				c?.turno?.hora_turno === turno?.hora_turno &&
				c?.turno?.horario?.medico?.id_medico === turno?.horario?.medico?.id_medico &&
				c?.turno?.horario?.medico?.especialidad?.id_especialidad === turno?.horario?.medico?.especialidad?.id_especialidad
			);
		});

		if (citaDuplicada) {
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

module.exports = {
	obtenerCitas,
	obtenerCitasDelDiaActual,
	obtenerCitasDesdeHoy,
    obtenerCitasPorRango,
	getEdad,
    getGrupoEtario,
	crearCita };
