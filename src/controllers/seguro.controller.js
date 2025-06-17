const seguroService = require('../services/seguro.service');
const infoMilitarService = require('../services/info_militar.service');
const { formatFecha} = require('../utils/date_utils');
const errorMessages = require('../utils/error_messages');
const successMessages = require('../utils/success_messages');

// Registrar un seguro (solo administradores)
async function registrarSeguro(req, res) {
    const { identificacion } = req.params;
    const { nombre_seguro, tipo_seguro, cobertura, ...otrosDatos } = req.body;

    try {
        // Validar que el paciente existe
        const paciente = await infoMilitarService.validarPacienteExistente(identificacion);
        if (!paciente) {
            return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });
        }

        // Verificar que el paciente no tenga ya un seguro
        await seguroService.validarSeguroRegistrado(paciente.id_paciente);

        // Crear un nuevo seguro
        const seguro = await seguroService.crearSeguro(paciente.id_paciente, {
            nombre_seguro, tipo_seguro, cobertura, ...otrosDatos
        });

        // Formatear fecha
        const seguroFormateado = {
            ...seguro.toJSON(),
            fecha_inicio: formatFecha(seguro.fecha_inicio),
            fecha_fin: formatFecha(seguro.fecha_fin)
        };

        return res.status(201).json({
            message: successMessages.registroExitoso,
            seguro: seguroFormateado
        });
    } catch (error) {
        console.error("❌ Error en registrarSeguro:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// Obtener seguro de un paciente (solo administradores y médicos)
async function getBySeguro(req, res) {
    const { identificacion } = req.params;

    try {
        // Validar que el paciente existe
        const paciente = await infoMilitarService.validarPacienteExistente(identificacion);
        if (!paciente) {
            return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });
        }

        // Obtener el seguro del paciente
        const seguro = await seguroService.obtenerSeguro(paciente.id_paciente);
        if (!seguro) {
            return res.status(404).json({ message: errorMessages.seguroNoEncontrado });
        }

        // Formatear fecha
        const seguroFormateado = {
            ...seguro.toJSON(),
            fecha_inicio: formatFecha(seguro.fecha_inicio),
            fecha_fin: formatFecha(seguro.fecha_fin)
        };

        return res.status(200).json(seguroFormateado);
    } catch (error) {
        console.error("❌ Error en getBySeguro:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// Actualizar seguro de un paciente (solo administradores)
async function actualizarSeguro(req, res) {
    const { identificacion } = req.params;
    const { id_usuario_modificador, ...nuevosDatos } = req.body;

    if (!id_usuario_modificador) {
        return res.status(400).json({ message: "El id_usuario_modificador es obligatorio para registrar cambios." });
    }

    try {
        // Validar que el paciente existe
        const paciente = await infoMilitarService.validarPacienteExistente(identificacion);
        if (!paciente) {
            return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });
        }

        // Obtener el seguro asociado al paciente
        const seguro = await seguroService.obtenerSeguro(paciente.id_paciente);

        // Actualizar el seguro y registrar historial
        const seguroActualizado = await seguroService.actualizarSeguro(seguro, nuevosDatos, id_usuario_modificador);

        const seguroFormateado = {
            ...seguroActualizado.toJSON(),
            fecha_inicio: formatFecha(seguroActualizado.fecha_inicio),
            fecha_fin: formatFecha(seguroActualizado.fecha_fin)
        };

        return res.status(200).json({
            message: successMessages.informacionActualizada,
            seguro: seguroFormateado
        });
    } catch (error) {
        console.error("❌ Error en actualizarSeguro:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = { registrarSeguro, getBySeguro, actualizarSeguro };
