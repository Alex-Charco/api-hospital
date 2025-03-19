const recetaService = require('../services/receta.service');
const { sequelize } = require("../models");
const successMessages = require('../utils/success_messages');
const errorMessages = require('../utils/error_messages');

async function registrarReceta(req, res) {
    try {
        const { id_nota_evolutiva, fecha_prescripcion, medicaciones, receta_autorizacion, ...datosReceta } = req.body;

        if (!id_nota_evolutiva || !fecha_prescripcion) {
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }

        const transaction = await sequelize.transaction();

        try {
            const resultado = await recetaService.crearReceta({
                id_nota_evolutiva,
                fecha_prescripcion,
                medicaciones,
                receta_autorizacion, // Aseguramos que se pase correctamente a `crearReceta`
                ...datosReceta
            }, transaction);

            await transaction.commit();

            return res.status(201).json({
                message: "Registro exitoso",
                receta: resultado.receta,
                medicacionesGuardadas: resultado.medicacionesGuardadas,
                medicamentosGuardados: resultado.medicamentosGuardados,
                posologiasGuardadas: resultado.posologiasGuardadas,
                recetaAutorizacion: resultado.recetaAutorizacion // Se devuelve el detalle de la autorización
            });

        } catch (error) {
            await transaction.rollback();
            console.error("❌ Error en registrarReceta:", error);
            return res.status(500).json({ message: error.message || "Error interno del servidor" });
        }

    } catch (error) {
        console.error("❌ Error general en registrarReceta:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
}

async function obtenerRecetas(req, res) {
    try {
        const { id_nota_evolutiva, identificacion } = req.query;

        if (!id_nota_evolutiva && !identificacion) {
            return res.status(400).json({ message: errorMessages.filtroRequerido });
        }

        // Obtener la receta junto con medicacion, medicamento, posologia, receta_autorizada
        const receta = await recetaService.obtenerRecetasDetalladas({ id_nota_evolutiva, identificacion });

        if (!receta || receta.length === 0) {
            return res.status(404).json({ message: errorMessages.notaNoEncontrada });
        }

        return res.status(200).json({ 
            message: successMessages.recetaEncontrada,
            receta
        });

    } catch (error) {
        console.error("❌ Error en obtenerReceta:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

async function actualizarReceta(req, res) {
    try {
        const { id_receta } = req.params;
        const nuevosDatos = req.body;

        if (!id_receta) {
            return res.status(400).json({ message: errorMessages.idRecetaRequerido });
        }

        const recetaActualizada = await recetaService.actualizarRecetaDetallada(id_receta, nuevosDatos);

        return res.status(200).json({
            message: successMessages.informacionActualizada,
            receta: recetaActualizada
        });
    } catch (error) {
        console.error("❌ Error en actualizarReceta:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = {
    registrarReceta,
    obtenerRecetas,
    actualizarReceta
}
