const { Receta, Medicacion, Medicamento, Posologia, RecetaAutorizacion, NotaEvolutiva } = require('../models');
const medicacionService = require("./medicacion.service");
const medicamentoService = require("./medicamento.service");
const posologiaService = require("./posologia.service");
const recetaAutorizacionService = require("./receta_autorizacion.service");
const notaEvolutivaService = require("./nota_evolutiva.service");
const pacienteService = require("./paciente.service");
const familiarService = require("./familiar.service");
const personaExternaService = require("./persona_externa.service");
const errorMessages = require("../utils/error_messages");
const { formatFecha } = require('../utils/date_utils');

async function crearReceta(data, transaction) {
    try {
        const { id_nota_evolutiva, fecha_prescripcion, medicaciones = [], receta_autorizacion, ...datosReceta } = data;

        // Verificar existencia de nota evolutiva
        const nota_evolutiva = await obtenerNotaEvolutivaPorId(id_nota_evolutiva);
        if (!nota_evolutiva) throw new Error("Nota evolutiva no encontrada");

        // Verificar existencia de cita
        const cita = await notaEvolutivaService.obtenerCitaPorId(nota_evolutiva.id_cita);
        if (!cita) throw new Error("Cita no encontrada");

        const { id_paciente } = cita;
        if (!id_paciente) throw new Error("Paciente no encontrado");

        // Formatear fechas
        const fechaPrescripcionFormatted = formatFecha(fecha_prescripcion);
        const fechaVigenciaFormatted = formatFecha(new Date(new Date(fecha_prescripcion).setDate(new Date(fecha_prescripcion).getDate() + 3)));

        // Crear receta
        const receta = await Receta.create({
            id_nota_evolutiva,
            fecha_prescripcion: fechaPrescripcionFormatted,
            fecha_vigencia: fechaVigenciaFormatted,
            ...datosReceta
        }, { transaction });

        // Procesar medicaciones y medicamentos asociados
        const medicacionesGuardadas = await Promise.all(medicaciones.map(async (med) => {
            if (!med.medicamento || !med.medicamento.nombre_medicamento) {
                console.error("❌ Error: No se recibió el objeto medicamento.");
                throw new Error("El nombre del medicamento es obligatorio.");
            }

            // Crear medicamento
            const medicamentoCreado = await medicamentoService.crearMedicamento({
                nombre_medicamento: med.medicamento.nombre_medicamento,
                cum: med.medicamento.cum || '',
                forma_farmaceutica: med.medicamento.forma_farmaceutica || '',
                via_administracion: med.medicamento.via_administracion || '',
                concentracion: med.medicamento.concentracion || '',
                presentacion: med.medicamento.presentacion || '',
                tipo: med.medicamento.tipo || '',
                cantidad: med.medicamento.cantidad || 0
            }, transaction);

            // Crear medicación
            const medicacionCreada = await medicacionService.crearMedicacion({
                id_receta: receta.id_receta,
                id_medicamento: medicamentoCreado.id_medicamento,
                externo: med.externo || 0,
                indicacion: med.indicacion || '',
                signo_alarma: med.signo_alarma || '',
                indicacion_no_farmacologica: med.indicacion_no_farmacologica || '',
                recomendacion_no_farmacologica: med.recomendacion_no_farmacologica || ''
            }, transaction);

            return { medicacion: medicacionCreada, medicamento: medicamentoCreado };
        }));

        // Crear posologías
        const posologiasGuardadas = await Promise.all(medicacionesGuardadas.flatMap(({ medicacion }, index) => {
            return (medicaciones[index].posologias || []).map(async (posologia) => {
                return await posologiaService.crearPosologia({
                    id_medicacion: medicacion.id_medicacion,
                    ...posologia
                }, transaction);
            });
        }));

        // Crear receta autorizaciones
        let recetaAutorizacion = null;

        if (receta_autorizacion) {
            const { tipo_autorizado, id_paciente, id_familiar, id_persona_externa } = receta_autorizacion;

            if (!tipo_autorizado) {
                throw new Error("El campo tipo_autorizado es obligatorio en receta_autorizacion.");
            }

            const nuevaAutorizacion = await recetaAutorizacionService.crearRecetaAutorizacion({
                id_receta: receta.id_receta,
                id_paciente: tipo_autorizado === 'PACIENTE' ? id_paciente : null,
                id_familiar: tipo_autorizado === 'FAMILIAR' ? id_familiar : null,
                id_persona_externa: tipo_autorizado === 'EXTERNO' ? id_persona_externa : null,
                tipo_autorizado
            }, transaction);

            // Obtener los datos completos del autorizado usando la nueva función
            const datosAutorizado = await obtenerDatosAutorizado(tipo_autorizado, id_paciente, id_familiar, id_persona_externa);

            recetaAutorizacion = {
                id_receta_autorizacion: nuevaAutorizacion.id_receta_autorizacion,
                tipo: tipo_autorizado,
                nombre: datosAutorizado
					? `${datosAutorizado.primer_nombre || ''} ${datosAutorizado.segundo_nombre || ''} ${datosAutorizado.primer_apellido || ''} ${datosAutorizado.segundo_apellido || ''}`.trim()
					: "",
                celular: datosAutorizado?.celular || "",
                telefono: datosAutorizado?.telefono || "",
                correo: datosAutorizado?.correo || "",
                direccion: datosAutorizado?.direccion || ""
            };
        }

        // Retornar la receta con los datos creados
        return {
            receta: {
                ...receta.toJSON(),
                fecha_prescripcion: fechaPrescripcionFormatted,
                fecha_vigencia: fechaVigenciaFormatted
            },
            medicacionesGuardadas,
            posologiasGuardadas,
            recetaAutorizacion
        };

    } catch (error) {
        throw new Error("Error al crear la receta: " + error.message);
    }
}

async function obtenerDatosAutorizado(tipo_autorizado, id_paciente, id_familiar, id_persona_externa) {
    let datosAutorizado;

    if (tipo_autorizado === "PACIENTE") {
        datosAutorizado = await pacienteService.obtenerPacientePorId(id_paciente);
    } else if (tipo_autorizado === "FAMILIAR") {
        datosAutorizado = await familiarService.obtenerFamiliarPorId(id_familiar);
    } else if (tipo_autorizado === "EXTERNO") {
        datosAutorizado = await personaExternaService.obtenerPersonaExternaPorId(id_persona_externa);
    }

    return datosAutorizado;
}



// no funcion 
/*async function crearReceta(data, transaction) {
    try {
        const { id_nota_evolutiva, fecha_prescripcion, medicaciones = [], receta_autorizaciones = [], ...datosReceta } = data;

        // Verificar existencia de nota evolutiva
        const nota_evolutiva = await obtenerNotaEvolutivaPorId(id_nota_evolutiva);
        if (!nota_evolutiva) throw new Error("Nota evolutiva no encontrada");

        // Verificar existencia de cita
        const cita = await notaEvolutivaService.obtenerCitaPorId(nota_evolutiva.id_cita);
        if (!cita) throw new Error("Cita no encontrada");

        const { id_paciente } = cita;
        if (!id_paciente) throw new Error("Paciente no encontrado");

        // Formatear fechas
        const fechaPrescripcionFormatted = formatFecha(fecha_prescripcion);
        const fechaVigenciaFormatted = formatFecha(new Date(new Date(fecha_prescripcion).setDate(new Date(fecha_prescripcion).getDate() + 3)));

        // Crear receta
        const receta = await Receta.create({
            id_nota_evolutiva,
            fecha_prescripcion: fechaPrescripcionFormatted,
            fecha_vigencia: fechaVigenciaFormatted,
            ...datosReceta
        }, { transaction });

        // Crear medicaciones y medicamentos asociados
        const medicacionesGuardadas = await Promise.all(medicaciones.map(async (med) => {
            if (!med.medicamento || !med.medicamento.nombre_medicamento) {
                console.error("❌ Error: No se recibió el objeto medicamento.");
                throw new Error("El nombre del medicamento es obligatorio.");
            }

            // Crear medicamento
            const medicamentoCreado = await medicamentoService.crearMedicamento({
                nombre_medicamento: med.medicamento.nombre_medicamento,
                cum: med.medicamento.cum || '',
                forma_farmaceutica: med.medicamento.forma_farmaceutica || '',
                via_administracion: med.medicamento.via_administracion || '',
                concentracion: med.medicamento.concentracion || '',
                presentacion: med.medicamento.presentacion || '',
                tipo: med.medicamento.tipo || '',
                cantidad: med.medicamento.cantidad || 0
            }, transaction);

            // Crear medicación
            const medicacionCreada = await medicacionService.crearMedicacion({
                id_receta: receta.id_receta,
                id_medicamento: medicamentoCreado.id_medicamento,
                externo: med.externo || 0,
                indicacion: med.indicacion || '',
                signo_alarma: med.signo_alarma || '',
                indicacion_no_farmacologica: med.indicacion_no_farmacologica || '',
                recomendacion_no_farmacologica: med.recomendacion_no_farmacologica || ''
            }, transaction);

            return { medicacion: medicacionCreada, medicamento: medicamentoCreado };
        }));

        // Crear posologías
        const posologiasGuardadas = await Promise.all(medicacionesGuardadas.flatMap(({ medicacion }, index) => {
            return (medicaciones[index].posologias || []).map(async (posologia) => {
                return await posologiaService.crearPosologia({
                    id_medicacion: medicacion.id_medicacion,
                    ...posologia
                }, transaction);
            });
        }));

        // Crear receta autorizaciones
        let recetaAutorizacionGuardada = null;
        
        if (receta_autorizacion) {
            const { tipo_autorizado, id_paciente, id_familiar, id_persona_externa } = receta_autorizacion;

            if (!tipo_autorizado) {
                throw new Error("El campo tipo_autorizado es obligatorio en receta_autorizacion.");
            }

            const nuevaAutorizacion = await recetaAutorizacionService.crearRecetaAutorizacion({
                id_receta: receta.id_receta,
                id_paciente: tipo_autorizado === 'PACIENTE' ? id_paciente : null,
                id_familiar: tipo_autorizado === 'FAMILIAR' ? id_familiar : null,
                id_persona_externa: tipo_autorizado === 'EXTERNO' ? id_persona_externa : null,
                tipo_autorizado
            }, transaction);

            recetaAutorizacionGuardada = nuevaAutorizacion;
        }


        // Retornar la receta con datos creados
        return {
            receta: {
                ...receta.toJSON(),
                fecha_prescripcion: fechaPrescripcionFormatted,
                fecha_vigencia: fechaVigenciaFormatted
            },
            medicacionesGuardadas,
            posologiasGuardadas,
            recetaAutorizacionesGuardadas
        };

    } catch (error) {
        throw new Error("Error al crear la receta: " + error.message);
    }
}
*/
// falta receta_autorizacion
/*async function crearReceta(data, transaction) {
    try {
        const { id_nota_evolutiva, fecha_prescripcion, medicaciones = [], receta_autorizaciones = [], ...datosReceta } = data;

        // Verificar existencia de nota evolutiva
        const nota_evolutiva = await obtenerNotaEvolutivaPorId(id_nota_evolutiva);
        if (!nota_evolutiva) throw new Error("Nota evolutiva no encontrada");

        // Verificar existencia de cita
        const cita = await notaEvolutivaService.obtenerCitaPorId(nota_evolutiva.id_cita);
        if (!cita) throw new Error("Cita no encontrada");

        const { id_paciente } = cita;
        if (!id_paciente) throw new Error("Paciente no encontrado");

        // Formatear fechas
        const fechaPrescripcionFormatted = formatFecha(fecha_prescripcion);
        const fechaVigenciaFormatted = formatFecha(new Date(new Date(fecha_prescripcion).setDate(new Date(fecha_prescripcion).getDate() + 3)));

        // Crear receta
        const receta = await Receta.create({
            id_nota_evolutiva,
            fecha_prescripcion: fechaPrescripcionFormatted,
            fecha_vigencia: fechaVigenciaFormatted,
            ...datosReceta
        }, { transaction });

        // Crear medicaciones y medicamentos asociados
        const medicacionesGuardadas = await Promise.all(medicaciones.map(async (med) => {
			if (!med.medicamento || !med.medicamento.nombre_medicamento) {
				console.error("❌ Error: No se recibió el objeto medicamento.");
				throw new Error("El nombre del medicamento es obligatorio.");
			}

			// Crear medicamento primero
			const medicamentoCreado = await medicamentoService.crearMedicamento({
				nombre_medicamento: med.medicamento.nombre_medicamento,
				cum: med.medicamento.cum || '',
				forma_farmaceutica: med.medicamento.forma_farmaceutica || '',
				via_administracion: med.medicamento.via_administracion || '',
				concentracion: med.medicamento.concentracion || '',
				presentacion: med.medicamento.presentacion || '',
				tipo: med.medicamento.tipo || '',
				cantidad: med.medicamento.cantidad || 0
			}, transaction);

			// Crear medicación asociada al medicamento y a la receta
			const medicacionCreada = await medicacionService.crearMedicacion({
				id_receta: receta.id_receta,
				id_medicamento: medicamentoCreado.id_medicamento,
				externo: med.externo || 0,
				indicacion: med.indicacion || '',
				signo_alarma: med.signo_alarma || '',
				indicacion_no_farmacologica: med.indicacion_no_farmacologica || '',
				recomendacion_no_farmacologica: med.recomendacion_no_farmacologica || ''
			}, transaction);

			return { medicacion: medicacionCreada, medicamento: medicamentoCreado };
		}));

        // Crear posologías
		const posologiasGuardadas = await Promise.all(medicacionesGuardadas.flatMap(({ medicacion }, index) => {
			return (medicaciones[index].posologias || []).map(async (posologia) => {
				return await posologiaService.crearPosologia({
					id_medicacion: medicacion.id_medicacion,
					...posologia
				}, transaction);
			});
		}));

        // Crear receta autorizaciones
        const recetaAutorizacionesGuardadas = await Promise.all(receta_autorizaciones.map(async (rec) => {
            return await recetaAutorizacionService.crearRecetaAutorizacion({
                id_receta: receta.id_receta,
                ...rec
            }, transaction);
        }));

        // Retornar la receta con datos creados
        return {
            receta: {
                ...receta.toJSON(),
                fecha_prescripcion: fechaPrescripcionFormatted,
                fecha_vigencia: fechaVigenciaFormatted
            },
            medicacionesGuardadas,
            posologiasGuardadas,
            recetaAutorizacionesGuardadas
        };

    } catch (error) {
        throw new Error("Error al crear la receta: " + error.message);
    }
}
*/
/*async function crearReceta(data, transaction) {
    try {
        const { 
            id_nota_evolutiva, 
            fecha_prescripcion, 
            medicaciones = [], 
            medicamentos = [], 
            posologias = [], 
            receta_autorizaciones = [], 
            ...datosReceta 
        } = data;

        // Formatear fecha_prescripcion y fecha_vigencia
        const fechaPrescripcionFormatted = fecha_prescripcion 
            ? new Date(fecha_prescripcion).toISOString().split('T')[0] 
            : null;

        const fechaVigencia = data.fecha_vigencia || new Date(new Date(fecha_prescripcion).setDate(new Date(fecha_prescripcion).getDate() + 3));
        const fechaVigenciaFormatted = new Date(fechaVigencia).toISOString().split('T')[0];

        // Validar existencia de la nota evolutiva
        const nota_evolutiva = await obtenerNotaEvolutivaPorId(id_nota_evolutiva);
        if (!nota_evolutiva) throw new Error("Nota evolutiva no encontrada");

        // Obtener la cita y validar el paciente
        const cita = await notaEvolutivaService.obtenerCitaPorId(nota_evolutiva.id_cita);
        if (!cita) throw new Error("Cita no encontrada");

        const { id_paciente } = cita;
        if (!id_paciente) throw new Error("Paciente no encontrado");

        // Crear la receta
        const receta = await Receta.create({
            id_nota_evolutiva,
            fecha_prescripcion: fechaPrescripcionFormatted,
            fecha_vigencia: fechaVigenciaFormatted,
            ...datosReceta
        }, { transaction });

        // Insertar medicaciones
        const medicacionesGuardados = await Promise.all(medicaciones.map(async med => {
            return await medicacionService.crearMedicacion({
                id_receta: receta.id_receta,
                ...med
            }, transaction);
        }));

        // Insertar medicamentos vinculados a las medicaciones creadas
        const medicamentosGuardados = [];
		for (const medicacion of medicacionesGuardados) {
			if (medicacion.id_medicamento) {
				const nuevoMedicamento = await medicamentoService.crearMedicamento({
					id_medicacion: medicacion.id_medicacion,
					...medicacion
				}, transaction);
				medicamentosGuardados.push(nuevoMedicamento);
			}
		}

        // Insertar posologías asociadas
        const posologiasGuardados = [];
		for (const medicacion of medicacionesGuardados) {
			if (medicacion.posologias) {  // Asegurar que tiene posologías
				for (const posologia of medicacion.posologias) {
					const nuevaPosologia = await posologiaService.crearPosologia({
						id_medicacion: medicacion.id_medicacion,
						...posologia
					}, transaction);
					posologiasGuardados.push(nuevaPosologia);
				}
			}
		}

        // Insertar receta_autorizaciones
        const recetaAutorizacionesGuardadas = await Promise.all(receta_autorizaciones.map(async rec => {
            return await recetaAutorizacionService.crearRecetaAutorizacion({
                id_receta: receta.id_receta,
                ...rec
            }, transaction);
        }));

        // Retornar la receta con los datos guardados
        return {
            receta,
            medicacionesGuardados,
            medicamentosGuardados,
            posologiasGuardados,
            recetaAutorizacionesGuardadas
        };

    } catch (error) {
        throw new Error("Error al crear la receta: " + error.message);
    }
}*/

async function obtenerNotaEvolutivaPorId(id_nota_evolutiva) {
    try {
        return await NotaEvolutiva.findOne({ where: { id_nota_evolutiva } });
    } catch (error) {
        throw new Error(errorMessages.errorObtenerNotaEvolutiva + error.message);
    }
}

async function obtenerRecetasDetalladas({ id_nota_evolutiva = null, identificacion = null }) {
    let whereClause = {};

    if (id_nota_evolutiva) {
        whereClause.id_nota_evolutiva = id_nota_evolutiva;
    } else if (identificacion) {
        const notaEvolutiva = await NotaEvolutiva.findOne({ where: { identificacion } });
        if (!notaEvolutiva) {
            throw new Error(errorMessages.notaNoEncontrada);
        }
        whereClause.id_nota_evolutiva = notaEvolutiva.id_nota_evolutiva;
    }

    // Buscar recetas con sus datos asociados
    const recetas = await Receta.findAll({
        where: whereClause,
        include: [
            {
                model: Medicacion,
                as: 'medicaciones',
                include: [
                    {
                        model: Medicamento,
                        as: 'medicamento'
                    },
                    {
                        model: Posologia,
                        as: 'posologias'
                    }
                ]
            },
            {
                model: RecetaAutorizacion,
                as: 'receta_autorizacion'
            }
        ]
    });

    if (!recetas || recetas.length === 0) {
        throw new Error(errorMessages.notaNoEncontrada);
    }

    return recetas;
}

async function actualizarRecetaDetallada(id_receta, nuevosDatos) { 
    const receta = await Receta.findByPk(id_receta, {
         include: [
            {
                model: Medicacion,
                as: 'medicaciones',
                include: [
                    {
                        model: Medicamento,
                        as: 'medicamento'
                    },
                    {
                        model: Posologia,
                        as: 'posologias'
                    }
                ]
            },
            {
                model: RecetaAutorizacion,
                as: 'receta_autorizacion'
            }
        ]
    });

    if (!receta) {
        throw new Error(errorMessages.recetaNoEncontrada);
    }

    // Actualizar datos de la nota
    await receta.update(nuevosDatos);

    // ✅ Actualizar receta_autorizacion asociados
    /*if (nuevosDatos.links && Array.isArray(nuevosDatos.links)) {
        await Promise.all(nuevosDatos.links.map(async nuevoLink => {
            let link = await Link.findByPk(nuevoLink.id_link);
            if (link) {
                await link.update(nuevoLink);
            } else {
                await Link.create({ id_nota_evolutiva, ...nuevoLink });
            }
        }));
    }*/

    // ✅ Actualizar diagnósticos en paralelo
    if (nuevosDatos.meicaciones && Array.isArray(nuevosDatos.medicaciones)) {
        await Promise.all(nuevosDatos.medicaciones.map(async nuevaMedicacion => {
            let medicacion = await Medicacion.findByPk(nuevaMedicacion.id_medicacion);
            if (medicacion) {
                await medicacion.update(nuevaMedicacion);
            }

            if (nuevaMedicacion.medicamentos && Array.isArray(nuevaMedicacion.medicamentos)) {
                // ✅ Actualizar medicamentos en paralelo
                await Promise.all(nuevaMedicacion.medicamentos.map(async nuevoMedicamento => {
                    let medicamento = await Medicamento.findByPk(nuevoMedicamento.id_medicamento);
                    if (medicamento) {
                        await medicament.update(nuevoMedicamento);
                    }
                }));
            }
        }));
    }

    return nota;
}


module.exports = { crearReceta, obtenerDatosAutorizado, obtenerRecetasDetalladas, actualizarRecetaDetallada };

