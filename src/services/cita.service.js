const { Cita, Turno, Horario, Medico, Especialidad, Paciente } = require('../models');
const errorMessages = require("../utils/error_messages");
const sequelize = require("../config/db");
const { enviarCorreoConfirmacion } = require('./email.service');
const { Op } = require('sequelize');
const { formatFecha, formatFechaCompleta } = require('../utils/date_utils');

// ?? Función para obtener la fecha actual en formato YYYY-MM-DD
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ?? Función generica para obtener citas con filtros personalizados
/*async function obtenerCitas(whereConditions, fechaInicio = null, fechaFin = null, estado = null) {
    try {
        let condiciones = { ...whereConditions };

        // Agregar filtro por rango de fechas si se especifica
        if (fechaInicio && fechaFin) {
            condiciones['$turno.horario.fecha_horario$'] = { [Op.between]: [fechaInicio, fechaFin] };
        }

        // Agregar filtro por estado solo si la función recibe `estado`
        if (estado !== null) {
            condiciones['estado_cita'] = estado; // <- Asegúrate que sea el nombre correcto de tu columna
        }

        // DEBUG: Verificar que condiciones se están enviando a la consulta
        console.log("Condiciones de búsqueda:", condiciones);

        // Obtener citas
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

        // DEBUG: Mostrar resultado si es necesario
        console.log("Citas encontradas:", JSON.stringify(citas, null, 2));

        return Array.isArray(citas) ? citas : [];
    } catch (error) {
        console.error("Error en obtenerCitas:", error);
        throw new Error("Error al obtener citas: " + error.message);
    }
}
*/

// Función genérica para obtener citas con filtros personalizados
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

// 🔍 Función para obtener citas desde hoy en adelante **Nueva** v1
/*async function obtenerCitasDesdeHoy(whereConditions, estado = null) {
    const today = getTodayDate();

    return obtenerCitas({
        ...whereConditions,
        '$turno.horario.fecha_horario$': {
            [Op.gte]: today
        }
    }, null, null, estado);
}*/

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

// ? Función para obtener citas por rango de fechas y estado
/*async function obtenerCitasPorRango(whereConditions, fechaInicio, fechaFin, estado = null) {
    return obtenerCitas(whereConditions, fechaInicio, fechaFin, estado);
}*/

// Función para obtener citas por un rango de fechas
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

// services/cita.service.js
async function obtenerCitasAgrupadasPorPaciente(whereConditions, tipoConsulta, fechaInicio, fechaFin, estado) {
    let citas;

    if (tipoConsulta === 'rango') {
        citas = await obtenerCitasPorRango(whereConditions, fechaInicio, fechaFin, estado);
    } else if (tipoConsulta === 'desdeHoy') {
        citas = await obtenerCitasDesdeHoy(whereConditions, estado);
    } else {
        citas = await obtenerCitasDelDiaActual(whereConditions);
    }

    if (!citas || citas.length === 0) return null;

    // Asegurarse de que todas las citas son del mismo paciente
    const paciente = citas[0].paciente;

    // Filtrar citas solo para este paciente
    const citasPaciente = citas.filter(cita => cita.paciente.id_paciente === paciente.id_paciente);

    return {
        paciente: {
            id_paciente: paciente.id_paciente,
            identificacion: paciente.identificacion,
            nombre: [paciente.primer_nombre, paciente.segundo_nombre, paciente.primer_apellido, paciente.segundo_apellido]
                .filter(Boolean)
                .join(' '),
            correo: paciente.correo,
            edad: paciente.fecha_nacimiento ? getEdad(paciente.fecha_nacimiento) : null,
            grupo_etario: paciente.fecha_nacimiento ? getGrupoEtario(getEdad(paciente.fecha_nacimiento)) : null
        },
        citas: citasPaciente.map(cita => ({
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
    };
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
	obtenerCitasAgrupadasPorPaciente,
	crearCita };
