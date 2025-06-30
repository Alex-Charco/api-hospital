const recetaService = require('../services/receta.service');
const { sequelize } = require("../models");
const successMessages = require('../utils/success_messages');
const errorMessages = require('../utils/error_messages');

async function registrarReceta(req, res) {
    try {
        const { id_nota_evolutiva, fecha_prescripcion, medicaciones, receta_autorizacion, ...datosReceta } = req.body;

        if (!id_nota_evolutiva || !fecha_prescripcion) {
            return res.status(400).json({ message: errorMessages.faltanDatos });
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
            return res.status(500).json({ message: error.message || errorMessages.errorServidor });
        }

    } catch (error) {
        console.error("❌ Error general en registrarReceta:", error);
        return res.status(500).json({ message: errorMessages.errorServidor });
    }
}

async function obtenerRecetas(req, res) {
    try {
        const { id_nota_evolutiva, identificacion, page = 1, limit = 5 } = req.query;

        if (!id_nota_evolutiva && !identificacion) {
            return res.status(400).json({ message: errorMessages.filtroRequerido });
        }

        const resultado = await recetaService.obtenerRecetasDetalladas({
            id_nota_evolutiva,
            identificacion,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        return res.status(200).json({
            message: successMessages.recetaEncontrada,
            ...resultado
        });

    } catch (error) {
        console.error("❌ Error en obtenerReceta:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

const obtenerDiagnosticosPorNota = async (req, res) => {
  try {
    const { id_nota_evolutiva } = req.params;
    const diagnosticos = await recetaService.obtenerDiagnosticosPorNota(id_nota_evolutiva);

    if (!diagnosticos || diagnosticos.length === 0) {
      return res.status(404).json({ message: "No se encontraron diagnósticos" });
    }

    return res.status(200).json(diagnosticos);
  } catch (error) {
    console.error("Error en obtenerDiagnosticosPorNota:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

async function obtenerOpcionesAutorizado(req, res) {
  try {
    const { id_paciente } = req.query;

    if (!id_paciente) {
      return res.status(400).json({ message: "Falta el id_paciente" });
    }

    const { paciente, familiar } = await recetaService.obtenerPacienteYFamiliarPorId(id_paciente);

    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    const formatPersona = (persona, tipo) => ({
      tipo,
      id: persona?.id_paciente || persona?.id_familiar || null,
      identificacion: persona.identificacion || '',
      nombres: [persona.primer_nombre, persona.segundo_nombre].filter(Boolean).join(' '),
      apellidos: [persona.primer_apellido, persona.segundo_apellido].filter(Boolean).join(' '),
      telefono: persona.telefono || '',
      celular: persona.celular || '',
      direccion: persona.direccion || persona?.residencia?.direccion || '',
      correo: persona.correo || ''
    });

    const datos = {
      paciente: formatPersona(paciente, "PACIENTE"),
      familiar: familiar ? formatPersona(familiar, "FAMILIAR") : null
    };

    return res.json(datos);

  } catch (error) {
    console.error("❌ Error en obtenerOpcionesAutorizado:", error);
    res.status(500).json({ message: "Error del servidor" });
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
	obtenerDiagnosticosPorNota,
	obtenerOpcionesAutorizado,
    actualizarReceta
}
