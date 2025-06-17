const infoMilitarService = require('../services/info_militar.service');
const errorMessages = require('../utils/error_messages');
const successMessages = require('../utils/success_messages');

// Crear nuevo registro de información militar (solo administradores)
async function registrarInfoMilitar(req, res) {
    const { identificacion, cargo, grado, fuerza, unidad } = req.body;

    try {
        const paciente = await infoMilitarService.validarPacienteExistente(identificacion);

        // Verificar si el paciente no fue encontrado
        if (!paciente) {
            return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });
        }

        await infoMilitarService.validarPacienteMilitar(paciente);
        await infoMilitarService.validarInfoMilitarNoRegistrada(paciente.id_paciente);

        const infoMilitar = await infoMilitarService.crearInfoMilitar(paciente.id_paciente, { cargo, grado, fuerza, unidad });

        return res.status(201).json({
            message: successMessages.registroExitoso,
            infoMilitar
        });
    } catch (error) {
        console.error("❌ Error en registrarInfoMilitar:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// Obtener información militar por paciente con No. identificación (administradores,y médicos) 
async function getByInfoMilitar(req, res) {
    try {
        const { identificacion } = req.params;
        const paciente = await infoMilitarService.validarPacienteExistente(identificacion);

        // Verificar si el paciente no fue encontrado
        if (!paciente) {
            return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });
        }

        const infoMilitar = await infoMilitarService.obtenerInfoMilitar(paciente.id_paciente);

        return res.status(200).json(infoMilitar);
    } catch (error) {
        console.error("❌ Error en getByInfoMilitar:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// ✅ Actualizar información militar (solo administradores)
async function actualizarInfoMilitar(req, res) {
    const { identificacion } = req.params;
    const { id_usuario_modificador, ...datosActualizados } = req.body;

    if (!id_usuario_modificador) {
        return res.status(400).json({ message: "id_usuario_modificador es obligatorio" });
    }

    try {
        const paciente = await infoMilitarService.validarPacienteExistente(identificacion);

        if (!paciente) {
            return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });
        }

        const infoMilitar = await infoMilitarService.obtenerInfoMilitar(paciente.id_paciente);

        const infoMilitarActualizado = await infoMilitarService.actualizarInfoMilitar(infoMilitar, datosActualizados, id_usuario_modificador);

        return res.status(200).json({
            message: successMessages.informacionActualizada,
            infoMilitar: infoMilitarActualizado
        });
    } catch (error) {
        console.error("❌ Error en actualizarInfoMilitar:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = { registrarInfoMilitar, getByInfoMilitar, actualizarInfoMilitar };