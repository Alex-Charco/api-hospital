const recetaService = require('../services/receta.service');
const { sequelize } = require("../models");
const successMessages = require('../utils/success_messages');
const errorMessages = require('../utils/error_messages');

/*async function registrarReceta(req, res) {
    try {
        const { 
            id_nota_evolutiva, 
            fecha_prescripcion, 
            medicaciones, 
            medicamentos, 
            posologias, 
            receta_autorizaciones, 
            ...datosReceta 
        } = req.body;

        if (!id_nota_evolutiva || !fecha_prescripcion) {
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }

        const transaction = await sequelize.transaction();
        const resultado = await recetaService.crearReceta({
            id_nota_evolutiva,
            fecha_prescripcion,
            medicaciones,
            medicamentos,
            posologias,
            receta_autorizaciones,
            ...datosReceta
        }, transaction);

        await transaction.commit();

        // Formatear fechas antes de enviarlas en la respuesta
        const recetaFormateada = {
            ...resultado.receta.toJSON(),
            fecha_prescripcion: new Date(resultado.receta.fecha_prescripcion).toISOString().split('T')[0],
            fecha_vigencia: new Date(resultado.receta.fecha_vigencia).toISOString().split('T')[0]
        };

        return res.status(201).json({ 
            message: "Registro exitoso", 
            receta: recetaFormateada,
            medicacionesGuardados: resultado.medicacionesGuardados,
            medicamentosGuardados: resultado.medicamentosGuardados,
            posologiasGuardados: resultado.posologiasGuardados,
            recetaAutorizacionesGuardadas: resultado.recetaAutorizacionesGuardadas
        });

    } catch (error) {
        console.error("❌ Error en registrarReceta:", error.toString());
        return res.status(500).json({ message: error.message || "Error interno del servidor" });
    }
}*/
// funicona menos receta autorizacion
/*async function registrarReceta(req, res) {
    try {
        const { id_nota_evolutiva, fecha_prescripcion, medicaciones, receta_autorizaciones, ...datosReceta } = req.body;

        if (!id_nota_evolutiva || !fecha_prescripcion) {
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }

        const transaction = await sequelize.transaction();

        try {
            const resultado = await recetaService.crearReceta({
                id_nota_evolutiva,
                fecha_prescripcion,
                medicaciones,
                receta_autorizaciones,
                ...datosReceta
            }, transaction);

            await transaction.commit();

            return res.status(201).json({
                message: "Registro exitoso",
                receta: resultado.receta,
                medicacionesGuardadas: resultado.medicacionesGuardadas,
                medicamentosGuardados: resultado.medicamentosGuardados,
                posologiasGuardadas: resultado.posologiasGuardadas,
                recetaAutorizacionesGuardadas: resultado.recetaAutorizacionesGuardadas
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
*/

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

// Obtener receta por ID de cita o identificación del paciente
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


/*async function actualizarReceta(req, res) {
    try {
        const { id_receta } = req.params;
        const nuevosDatos = req.body;

        if (!id_receta) {
            return res.status(400).json({ message: errorMessages.idNotaRequerido });
        }

        const recetaActualizada = await recetaService.actualizarRecetaDetallada(id_receta, nuevosDatos);

        // ✅ Insertar nuevos links en paralelo
        //if (nuevosDatos.links && Array.isArray(nuevosDatos.links)) {
            //await Promise.all(nuevosDatos.links.map(async nuevoLink => {
                //await linkService.crearLink({ id_nota_evolutiva, ...nuevoLink });
            //}));
        //}

        return res.status(200).json({
            message: successMessages.informacionActualizada,
            nota: notaActualizada
        });
    } catch (error) {
        console.error("\u274C Error en actualizarNotaEvolutiva:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}*/

module.exports = {
    registrarReceta,
    obtenerRecetas,
    actualizarReceta
}
