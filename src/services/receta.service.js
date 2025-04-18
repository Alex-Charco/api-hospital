const { Receta, Medicacion, Medicamento, Posologia, RecetaAutorizacion, NotaEvolutiva, Paciente, Familiar, PersonaExterna, Residencia, Cita } = require('../models');
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
        if (!nota_evolutiva) throw new Error(errorMessages.notaNoEncontrada);

        // Verificar existencia de cita
        const cita = await notaEvolutivaService.obtenerCitaPorId(nota_evolutiva.id_cita);
        if (!cita) throw new Error(errorMessages.citaNoEncontrada);

        const { id_paciente } = cita;
        if (!id_paciente) throw new Error(errorMessages.pacienteNoEncontrado);

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
            if (!med.medicamento?.nombre_medicamento) {
                console.error("❌ Error: No se recibió el objeto medicamento.");
                throw new Error(errorMessages.nombreaMedicamentoObligatorio);
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
                throw new Error(errorMessages.campoObligatorio);
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
                    ? [datosAutorizado.primer_nombre, datosAutorizado.segundo_nombre, datosAutorizado.primer_apellido, datosAutorizado.segundo_apellido]
                        .filter(Boolean) // Elimina valores nulos o undefined
                        .join(' ') // Une los nombres con un solo espacio
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
        throw new Error(errorMessages.errorCrearReceta + error.message);
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
        // Buscar al paciente por su identificación
        const paciente = await Paciente.findOne({ where: { identificacion } });
        if (!paciente) {
            throw new Error(errorMessages.notaNoEncontrada);
        }

        // Buscar la cita asociada al paciente
        const cita = await Cita.findOne({ where: { id_paciente: paciente.id_paciente } });
        if (!cita) {
            throw new Error(errorMessages.notaNoEncontrada);
        }

        // Buscar la nota evolutiva con el id_cita obtenido
        const notaEvolutiva = await NotaEvolutiva.findOne({ where: { id_cita: cita.id_cita } });
        if (!notaEvolutiva) {
            throw new Error(errorMessages.notaNoEncontrada);
        }

        whereClause.id_nota_evolutiva = notaEvolutiva.id_nota_evolutiva;
    }

    // Buscar recetas con todos los datos necesarios
    const recetas = await Receta.findAll({
        where: whereClause,
        include: [
            {
                model: Medicacion,
                as: 'medicaciones',
                include: [
                    { model: Medicamento, as: 'medicamento' },
                    { model: Posologia, as: 'posologias' }
                ]
            },
            {
                model: RecetaAutorizacion,
                as: 'receta_autorizacion',
                include: [
                    { 
                        model: Paciente, 
                        as: 'paciente',
                        attributes: ['id_paciente', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'celular', 'telefono', 'correo'],
                        include: [
                            {
                                model: Residencia,
                                as: 'residencia',
                                attributes: ['direccion']
                            }
                        ]
                    },
                    { 
                        model: Familiar, 
                        as: 'familiar',
                        attributes: ['id_familiar', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'celular', 'telefono', 'correo']
                    },
                    { 
                        model: PersonaExterna, 
                        as: 'persona_externa',
                        attributes: ['id_persona_externa', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'celular', 'telefono', 'correo']
                    }
                ]
            }
        ]
    });

    if (!recetas || recetas.length === 0) {
        throw new Error(errorMessages.notaNoEncontrada);
    }

    return recetas.map(receta => {
        const recetaAutorizacion = receta.receta_autorizacion || {};
        const paciente = recetaAutorizacion.paciente;
        const familiar = recetaAutorizacion.familiar;
        const personaExterna = recetaAutorizacion.persona_externa;

        return {
            id_receta: receta.id_receta,
            id_nota_evolutiva: receta.id_nota_evolutiva,
            fecha_prescripcion: receta.fecha_prescripcion,
            fecha_vigencia: receta.fecha_vigencia,
            medicaciones: receta.medicaciones.map(medicacion => ({
                id_medicacion: medicacion.id_medicacion,
                id_receta: medicacion.id_receta,
                id_medicamento: medicacion.id_medicamento,
                externo: medicacion.externo,
                indicacion: medicacion.indicacion,
                signo_alarma: medicacion.signo_alarma,
                indicacion_no_farmacologica: medicacion.indicacion_no_farmacologica,
                recomendacion_no_farmacologica: medicacion.recomendacion_no_farmacologica,
                medicamento: medicacion.medicamento,
                posologias: medicacion.posologias
            })),
            receta_autorizacion: {
                id_receta_autorizacion: recetaAutorizacion.id_receta_autorizacion,
                tipo_autorizado: recetaAutorizacion.tipo_autorizado,
                paciente: paciente ? {
                    id_paciente: paciente.id_paciente,
                    nombre: paciente
                    ? [paciente.primer_nombre, paciente.segundo_nombre, paciente.primer_apellido, paciente.segundo_apellido]
                        .filter(Boolean) // Elimina valores nulos o undefined
                        .join(' ') // Une los nombres con un solo espacio
                    : "",
                    celular: paciente.celular,
                    telefono: paciente.telefono,
                    correo: paciente.correo,
                    residencia: paciente.residencia ? paciente.residencia.direccion : null
                } : null,
                familiar: familiar ? {
                    id_familiar: familiar.id_familiar,
                    nombre: familiar
                    ? [familiar.primer_nombre, familiar.segundo_nombre, familiar.primer_apellido, familiar.segundo_apellido]
                        .filter(Boolean) // Elimina valores nulos o undefined
                        .join(' ') // Une los nombres con un solo espacio
                    : "",
                    celular: familiar.celular,
                    telefono: familiar.telefono,
                    correo: familiar.correo
                } : null,
                persona_externa: personaExterna ? {
                    id_persona_externa: personaExterna.id_persona_externa,
                    nombre: personaExterna
                    ? [personaExterna.primer_nombre, personaExterna.segundo_nombre, personaExterna.primer_apellido, personaExterna.segundo_apellido]
                        .filter(Boolean) // Elimina valores nulos o undefined
                        .join(' ') // Une los nombres con un solo espacio
                    : "",
                    celular: personaExterna.celular,
                    telefono: personaExterna.telefono,
                    correo: personaExterna.correo
                } : null
            }
        };
    });
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

    // ✅ Formatear fechas antes de actualizar
    if (nuevosDatos.fecha_prescripcion) {
        nuevosDatos.fecha_prescripcion = formatFecha(nuevosDatos.fecha_prescripcion);
    }

    if (nuevosDatos.fecha_vigencia) {
        nuevosDatos.fecha_vigencia = formatFecha(nuevosDatos.fecha_vigencia);
    }

    // ✅ Actualizar datos de la receta
    await receta.update(nuevosDatos);

    // ✅ Actualizar medicaciones en paralelo
    if (nuevosDatos.medicaciones && Array.isArray(nuevosDatos.medicaciones)) {
        await Promise.all(nuevosDatos.medicaciones.map(async nuevaMedicacion => {
            let medicacion = await Medicacion.findByPk(nuevaMedicacion.id_medicacion);
            if (medicacion) {
                await medicacion.update(nuevaMedicacion);
            }

            // ✅ Actualizar medicamentos en paralelo
            if (nuevaMedicacion.medicamentos && Array.isArray(nuevaMedicacion.medicamentos)) {
                await Promise.all(nuevaMedicacion.medicamentos.map(async nuevoMedicamento => {
                    let medicamento = await Medicamento.findByPk(nuevoMedicamento.id_medicamento);
                    if (medicamento) {
                        await medicamento.update(nuevoMedicamento);
                    }
                }));
            }

            // ✅ Actualizar posologías en paralelo
            if (nuevaMedicacion.posologias && Array.isArray(nuevaMedicacion.posologias)) {
                await Promise.all(nuevaMedicacion.posologias.map(async nuevaPosologia => {
                    let posologia = await Posologia.findByPk(nuevaPosologia.id_posologia);
                    if (posologia) {
                        await posologia.update(nuevaPosologia);
                    }
                }));
            }
        }));
    }

    // ✅ Actualizar receta_autorizacion si está presente
    if (nuevosDatos.receta_autorizacion) {
        let recetaAutorizacion = await RecetaAutorizacion.findByPk(nuevosDatos.receta_autorizacion.id_receta_autorizacion);
        if (recetaAutorizacion) {
            await recetaAutorizacion.update(nuevosDatos.receta_autorizacion);
        }
    }

    // Formatear fechas antes de devolver
    const recetaFormateada = {
        ...receta.toJSON(),
        fecha_prescripcion: formatFecha(receta.fecha_prescripcion),
        fecha_vigencia: formatFecha(receta.fecha_vigencia)
    };

    return {
        receta: recetaFormateada
    };
}

module.exports = { crearReceta, obtenerDatosAutorizado, obtenerRecetasDetalladas, actualizarRecetaDetallada };

