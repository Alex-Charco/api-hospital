const { NotaEvolutiva, Cita, Paciente, Diagnostico, Procedimiento, Link, SignosVitales } = require('../models');
const diagnosticoService = require("./diagnostico.service");
const procedimientoService = require("./procedimiento.service");
const linkService = require("./link.service");
const errorMessages = require("../utils/error_messages");
const { formatFechaCompletaLocal } = require('../utils/date_utils');

async function crearNota(data, transaction) {
    try {
        const { id_cita, motivo_consulta, diagnosticos = [], links = [], signos_vitales = null, ...datosNotaEvolutiva } = data;

        // 1️⃣ Validar que la cita exista
        const cita = await obtenerCitaPorId(id_cita);
        if (!cita) {
            throw new Error("Cita no encontrada");
        }

        const { id_paciente } = cita;
        if (!id_paciente) {
            throw new Error("Paciente no encontrado");
        }

        // 2️⃣ Crear la nota evolutiva principal
        const nota = await NotaEvolutiva.create({
            id_cita,
            id_paciente,
            motivo_consulta,
            ...datosNotaEvolutiva
        }, { transaction });

        // 3️⃣ Insertar signos vitales (solo si existen)
        let signosVitalesGuardados = null;
        if (signos_vitales) {
            signosVitalesGuardados = await SignosVitales.create({
                id_nota_evolutiva: nota.id_nota_evolutiva,
                ...signos_vitales
            }, { transaction });
        }

        // 4️⃣ Insertar diagnósticos
        const diagnosticosGuardados = [];

        for (const diag of diagnosticos) {
            const nuevoDiagnostico = await diagnosticoService.crearDiagnostico({
                id_nota_evolutiva: nota.id_nota_evolutiva,
                condicion: diag.condicion,
				tipo: diag.tipo,
                cie_10: diag.cie_10,
                descripcion: diag.descripcion
            }, transaction);

            diagnosticosGuardados.push(nuevoDiagnostico);

            // Procedimientos
            if (diag.procedimientos && Array.isArray(diag.procedimientos)) {
                for (const proc of diag.procedimientos) {
                    await procedimientoService.crearProcedimiento({
                        id_diagnostico: nuevoDiagnostico.id_diagnostico,
                        codigo: proc.codigo,
                        descripcion_proc: proc.descripcion_proc
                    }, transaction);
                }
            }
        }

        // 5️⃣ Insertar links
        const linksGuardados = await Promise.all(
            links.map(async link => {
                return await linkService.crearLink({
                    id_nota_evolutiva: nota.id_nota_evolutiva,
                    categoria: link.categoria,
                    nombre_documento: link.nombre_documento,
                    url: link.url,
                    descripcion: link.descripcion || null
                }, transaction);
            })
        );

        return { nota, diagnosticosGuardados, linksGuardados, signosVitalesGuardados };

    } catch (error) {
        throw new Error("Error al crear la nota evolutiva: " + error.message);
    }
}

// Obtener todas las notas evolutivas por ID de cita o identificación del paciente
async function obtenerNotasDetalladas({ id_cita = null, identificacion = null, id_paciente = null, page = 1, limit = 5 }) {
    const offset = (page - 1) * limit;

    const includeOptions = [
        {
            model: Diagnostico,
            as: 'Diagnosticos',
            include: [
                { model: Procedimiento, as: 'Procedimientos' }
            ]
        },
        { model: Link, as: 'links' },
		{ model: SignosVitales, as: 'signosVitales' }
    ];

    if (!id_cita) {
        if (!id_paciente && identificacion) {
            const paciente = await Paciente.findOne({ where: { identificacion } });
            if (!paciente) throw new Error(errorMessages.pacienteNoEncontrado);
            id_paciente = paciente.id_paciente;
        }

        includeOptions.push({
            model: Cita,
            as: 'cita',
            where: { id_paciente: id_paciente }
        });
    } else {
        includeOptions.push({
            model: Cita,
            as: 'cita'
        });
    }

    const whereClause = {};
    if (id_cita) {
        whereClause.id_cita = id_cita;
    }

    const total = await NotaEvolutiva.count({
        where: whereClause,
        include: includeOptions
    });

    const notas = await NotaEvolutiva.findAll({
        where: whereClause,
        include: includeOptions,
        order: [['id_nota_evolutiva', 'DESC']],
        limit: limit,
        offset: offset
    });

    const notasFormateadas = notas.map(nota => {
        const notaJson = nota.toJSON();
        notaJson.fecha_creacion = formatFechaCompletaLocal(notaJson.fecha_creacion);
        if (notaJson.cita && notaJson.cita.fecha_creacion) {
            notaJson.cita.fecha_creacion = formatFechaCompletaLocal(notaJson.cita.fecha_creacion);
        }
        return notaJson;
    });

    return {
        total,
        page,
        pages: Math.ceil(total / limit),
        data: notasFormateadas
    };
}

// Obtener una nota evolutiva por ID de nota_evolutiva
async function obtenerNotaDetalladaPorId(id_nota_evolutiva) {
    const includeOptions = [
        {
            model: Diagnostico,
            as: 'Diagnosticos',
            include: [
                { model: Procedimiento, as: 'Procedimientos' }
            ]
        },
        { model: Link, as: 'links' },
        { model: Cita, as: 'cita' },
		{ model: SignosVitales, as: 'signosVitales' }
    ];

    const nota = await NotaEvolutiva.findByPk(id_nota_evolutiva, {
        include: includeOptions
    });

    if (!nota) return null;

    const notaJson = nota.toJSON();

    // Formatear fechas si es necesario
    notaJson.fecha_creacion = formatFechaCompletaLocal(notaJson.fecha_creacion);
    if (notaJson.cita && notaJson.cita.fecha_creacion) {
        notaJson.cita.fecha_creacion = formatFechaCompletaLocal(notaJson.cita.fecha_creacion);
    }

    return notaJson;
}

async function obtenerCitaPorId(id_cita) {
    try {
        return await Cita.findOne({ where: { id_cita } });
    } catch (error) {
        throw new Error(errorMessages.errorObtenerCita + error.message);
    }
}

async function actualizarNota(id_nota_evolutiva, nuevosDatos) { 
    const nota = await NotaEvolutiva.findByPk(id_nota_evolutiva, {
        include: [
            {
                model: Diagnostico,
                as: 'Diagnosticos',
                include: [{ model: Procedimiento, as: 'Procedimientos' }]
            },
            {
                model: Link,
                as: 'links' 
            }
        ]
    });

    if (!nota) {
        throw new Error(errorMessages.notaNoEncontrada);
    }

    // Actualizar datos de la nota
    await nota.update(nuevosDatos);

    // ✅ Actualizar links asociados
    if (nuevosDatos.links && Array.isArray(nuevosDatos.links)) {
        await Promise.all(nuevosDatos.links.map(async nuevoLink => {
            let link = await Link.findByPk(nuevoLink.id_link);
            if (link) {
                await link.update(nuevoLink);
            } else {
                await Link.create({ id_nota_evolutiva, ...nuevoLink });
            }
        }));
    }

    // ✅ Actualizar diagnósticos en paralelo
    if (nuevosDatos.Diagnosticos && Array.isArray(nuevosDatos.Diagnosticos)) {
        await Promise.all(nuevosDatos.Diagnosticos.map(async nuevoDiagnostico => {
            let diagnostico = await Diagnostico.findByPk(nuevoDiagnostico.id_diagnostico);
            if (diagnostico) {
                await diagnostico.update(nuevoDiagnostico);
            }

            if (nuevoDiagnostico.Procedimientos && Array.isArray(nuevoDiagnostico.Procedimientos)) {
                // ✅ Actualizar procedimientos en paralelo
                await Promise.all(nuevoDiagnostico.Procedimientos.map(async nuevoProcedimiento => {
                    let procedimiento = await Procedimiento.findByPk(nuevoProcedimiento.id_procedimiento);
                    if (procedimiento) {
                        await procedimiento.update(nuevoProcedimiento);
                    }
                }));
            }
        }));
    }

    return nota;
}

module.exports = {
    crearNota,
    obtenerNotasDetalladas,
	obtenerNotaDetalladaPorId,
	obtenerCitaPorId,
	actualizarNota
};