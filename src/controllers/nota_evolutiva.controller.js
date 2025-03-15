const { sequelize } = require("../models");
const notaEvolutivaService = require("../services/nota_evolutiva.service");
const diagnosticoService = require("../services/diagnostico.service");
const procedimientoService = require("../services/procedimiento.service");
const errorMessages = require('../utils/error_messages');
const successMessages = require('../utils/success_messages');

// Registrar una nueva nota evolutiva
/*async function registrarNotaEvolutiva(req, res) {
    const { 
        id_cita, 
        motivo_consulta, 
        ...datosNotaEvolutiva
    } = req.body;

    try {
        if (!id_cita || !motivo_consulta) {
            return res.status(400).json({ message: errorMessages.faltanDatos });
        }

        // Obtener la cita y el id_paciente asociado
        const cita = await notaEvolutivaService.obtenerCitaPorId(id_cita);

        if (!cita) {
            return res.status(404).json({ message: errorMessages.citaNoEncontrada });
        }

        const { id_paciente } = cita;

        if (!id_paciente) {
            return res.status(400).json({ message: errorMessages.pacienteNoEncontrado });
        }

        // Registrar la nota evolutiva con id_paciente
        const nota = await notaEvolutivaService.crearNota({
            id_cita,
            id_paciente, // Agregamos el id_paciente
            motivo_consulta,
            ...datosNotaEvolutiva
        });

        return res.status(201).json({ message: successMessages.registroExitoso, nota });
    } catch (error) {
        console.error("❌ Error en registrarNotaEvolutiva:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}*/

// NO FUNCIONA PROCEDIMIENTO
/*async function registrarNotaEvolutiva(req, res) {
    const { id_cita, motivo_consulta, diagnosticos, procedimientos, ...datosNotaEvolutiva } = req.body;

    if (!id_cita || !motivo_consulta) {
        return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const transaction = await sequelize.transaction(); // 🔹 Inicia transacción

    try {
        // 1️⃣ Obtener la cita y su id_paciente
        const cita = await notaEvolutivaService.obtenerCitaPorId(id_cita);

        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }

        const { id_paciente } = cita;
        if (!id_paciente) {
            return res.status(400).json({ message: "Paciente no encontrado" });
        }

        // 2️⃣ Crear la nota evolutiva
        const nota = await notaEvolutivaService.crearNota({
            id_cita,
            id_paciente,
            motivo_consulta,
            ...datosNotaEvolutiva
        }, transaction);

        // 3️⃣ Insertar diagnósticos
        const diagnosticosGuardados = [];
        for (const diag of diagnosticos) {
            const nuevoDiagnostico = await diagnosticoService.crearDiagnostico({
                id_nota_evolutiva: nota.id_nota_evolutiva,
                ...diag
            }, transaction);
            diagnosticosGuardados.push(nuevoDiagnostico);
        }

        // 4️⃣ Insertar procedimientos asociados a cada diagnóstico
        const procedimientosGuardados = [];
        for (const proc of procedimientos) {
            const { id_diagnostico, ...procData } = proc;
            const diagnosticoAsociado = diagnosticosGuardados.find(d => d.id_diagnostico === id_diagnostico);
            if (diagnosticoAsociado) {
                const nuevoProcedimiento = await procedimientoService.crearProcedimiento({
                    id_diagnostico: diagnosticoAsociado.id_diagnostico,
                    ...procData
                }, transaction);
                procedimientosGuardados.push(nuevoProcedimiento);
            }
        }

        await transaction.commit(); // 🔹 Confirmamos la transacción

        return res.status(201).json({ 
            message: "Registro exitoso", 
            nota, 
            diagnosticosGuardados,
            procedimientosGuardados
        });
    } catch (error) {
        await transaction.rollback(); // 🔹 Revertimos la transacción en caso de error
        console.error("❌ Error en registrarNotaEvolutiva:", error.message);
        return res.status(500).json({ message: error.message || "Error interno del servidor" });
    }
}*/

async function registrarNotaEvolutiva(req, res) {
    const { id_cita, motivo_consulta, diagnosticos, procedimientos, ...datosNotaEvolutiva } = req.body;

    if (!id_cita || !motivo_consulta) {
        return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const transaction = await sequelize.transaction(); // 🔹 Inicia transacción

    try {
        // 1️⃣ Obtener la cita y su id_paciente
        const cita = await notaEvolutivaService.obtenerCitaPorId(id_cita);

        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }

        const { id_paciente } = cita;
        if (!id_paciente) {
            return res.status(400).json({ message: "Paciente no encontrado" });
        }

        // 2️⃣ Crear la nota evolutiva
        const nota = await notaEvolutivaService.crearNota({
            id_cita,
            id_paciente,
            motivo_consulta,
            ...datosNotaEvolutiva
        }, transaction);

        // 3️⃣ Insertar diagnósticos y mapear los nuevos ID generados
        const diagnosticosGuardados = [];
        for (const diag of diagnosticos) {
            const nuevoDiagnostico = await diagnosticoService.crearDiagnostico({
                id_nota_evolutiva: nota.id_nota_evolutiva,
                ...diag
            }, transaction);
            diagnosticosGuardados.push(nuevoDiagnostico);
        }

        // 4️⃣ Insertar procedimientos usando los nuevos ID de diagnósticos
        const procedimientosGuardados = [];
        for (const proc of procedimientos) {
            const diagnosticoAsociado = diagnosticosGuardados[procedimientos.indexOf(proc)]; // 🔹 Usar índice para mapear
            if (diagnosticoAsociado) {
                const nuevoProcedimiento = await procedimientoService.crearProcedimiento({
                    id_diagnostico: diagnosticoAsociado.id_diagnostico,
                    ...proc
                }, transaction);
                procedimientosGuardados.push(nuevoProcedimiento);
            }
        }

        await transaction.commit(); // 🔹 Confirmamos la transacción

        return res.status(201).json({
            message: "Registro exitoso",
            nota,
            diagnosticosGuardados,
            procedimientosGuardados
        });
    } catch (error) {
        await transaction.rollback(); // 🔹 Revertimos la transacción en caso de error
        console.error("❌ Error en registrarNotaEvolutiva:", error.message);
        return res.status(500).json({ message: error.message || "Error interno del servidor" });
    }
}

// Obtener nota evolutiva por ID de cita o identificación del paciente
async function obtenerNotaEvolutiva(req, res) {
    try {
        const { id_cita, identificacion } = req.query;

        if (!id_cita && !identificacion) {
            return res.status(400).json({ message: errorMessages.filtroRequerido });
        }

        const nota = await notaEvolutivaService.obtenerNotas({ id_cita, identificacion });

        if (!nota) {
            return res.status(404).json({ message: errorMessages.notaNoEncontrada });
        }

        return res.status(200).json({ message: successMessages.notaEncontrada, nota });

    } catch (error) {
        console.error("❌ Error en obtenerNotaEvolutiva:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// Actualizar una nota evolutiva
async function actualizarNotaEvolutiva(req, res) {
    try {
        const { id_nota_evolutiva } = req.params;
        const nuevosDatos = req.body;

        if (!id_nota_evolutiva) {
            return res.status(400).json({ message: errorMessages.idNotaRequerido });
        }

        const notaActualizada = await notaEvolutivaService.actualizarNota(id_nota_evolutiva, nuevosDatos);

        return res.status(200).json({
            message: successMessages.informacionActualizada,
            nota: notaActualizada
        });

    } catch (error) {
        console.error("❌ Error en actualizarNotaEvolutiva:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = {
    registrarNotaEvolutiva,
    obtenerNotaEvolutiva,
    actualizarNotaEvolutiva
};