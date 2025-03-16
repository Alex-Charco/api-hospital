const { NotaEvolutiva, Cita, Paciente, Diagnostico, Procedimiento, Link } = require('../models');
const diagnosticoService = require("./diagnostico.service");
const procedimientoService = require("./procedimiento.service");
const linkService = require("./link.service");
const errorMessages = require("../utils/error_messages");

async function crearNota(data, transaction) {
    try {
        const { id_cita, motivo_consulta, diagnosticos = [], procedimientos = [], links = [], ...datosNotaEvolutiva } = data;

        // 1️⃣ Obtener la cita y su id_paciente
        const cita = await obtenerCitaPorId(id_cita);
        if (!cita) {
            throw new Error("Cita no encontrada");
        }

        const { id_paciente } = cita;
        if (!id_paciente) {
            throw new Error("Paciente no encontrado");
        }

        // 2️⃣ Crear la nota evolutiva
        const nota = await NotaEvolutiva.create({
            id_cita,
            id_paciente,
            motivo_consulta,
            ...datosNotaEvolutiva
        }, { transaction });

        // 3️⃣ Insertar diagnósticos
        const diagnosticosGuardados = await Promise.all(diagnosticos.map(async diag => {
            return await diagnosticoService.crearDiagnostico({
                id_nota_evolutiva: nota.id_nota_evolutiva,
                ...diag
            }, transaction);
        }));

        // 4️⃣ Insertar procedimientos vinculados a los diagnósticos creados
        const procedimientosGuardados = await Promise.all(procedimientos.map(async (proc, index) => {
            const diagnosticoAsociado = diagnosticosGuardados[index]; // Vincular con diagnóstico correspondiente
            return diagnosticoAsociado ? await procedimientoService.crearProcedimiento({
                id_diagnostico: diagnosticoAsociado.id_diagnostico,
                ...proc
            }, transaction) : null;
        }));

        // 5️⃣ Insertar links asociados
        const linksGuardados = await Promise.all(links.map(async link => {
            return await linkService.crearLink({
                id_nota_evolutiva: nota.id_nota_evolutiva,
                ...link
            }, transaction);
        }));

        return { nota, diagnosticosGuardados, procedimientosGuardados, linksGuardados };

    } catch (error) {
        throw new Error("Error al crear la nota evolutiva: " + error.message);
    }
}

// Obtener todas las notas evolutivas por ID de cita o identificación del paciente
async function obtenerNotasDetalladas({ id_cita = null, identificacion = null }) {
    let whereClause = {};

    if (id_cita) {
        whereClause.id_cita = id_cita;
    } else if (identificacion) {
        const paciente = await Paciente.findOne({ where: { identificacion } });

        if (!paciente) {
            throw new Error(errorMessages.pacienteNoEncontrado);
        }

        const citas = await Cita.findAll({ where: { id_paciente: paciente.id_paciente } });

        if (!citas || citas.length === 0) {
            throw new Error(errorMessages.citaNoEncontrada);
        }

        const idsCitas = citas.map(cita => cita.id_cita);
        whereClause.id_cita = idsCitas;
    }

    // Buscar notas evolutivas con diagnósticos, procedimientos y links asociados
    const notas = await NotaEvolutiva.findAll({
        where: whereClause,
        include: [
            {
                model: Diagnostico,
                as: 'Diagnosticos',
                include: [
                    {
                        model: Procedimiento,
                        as: 'Procedimientos'
                    }
                ]
            },
            {
                model: Link,
                as: 'links' // Incluir links
            }
        ]
    });

    if (!notas || notas.length === 0) {
        throw new Error(errorMessages.notaNoEncontrada);
    }

    return notas;
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
	obtenerCitaPorId,
	actualizarNota
};