const { Seguro } = require('../models');
const errorMessages = require("../utils/error_messages");

// Validar que el paciente no tenga ya un seguro
async function validarSeguroRegistrado(id_paciente) {
    const seguro = await Seguro.findOne({ where: { id_paciente } });
    if (seguro) {
        throw new Error(errorMessages.seguroYaRegistrado);
    }
}

// Obtener seguro asociado a un paciente
async function obtenerSeguro(id_paciente) {
    const seguro = await Seguro.findOne({ where: { id_paciente } });

    if (!seguro) {
        throw new Error(errorMessages.seguroNoEncontrado);
    }

    return seguro;
}

// Crear un nuevo seguro
async function crearSeguro(id_paciente, datosSeguro) {
    try {
        return await Seguro.create({
            id_paciente,
            ...datosSeguro
        });
    } catch (error) {
        throw new Error(errorMessages.errorCrearSeguro + error.message);
    }
}

// Actualizar seguro de un paciente
async function actualizarSeguro(seguro, nuevosDatos) {
    try {
        return await seguro.update(nuevosDatos);
    } catch (error) {
        throw new Error(errorMessages.errorActualizarSeguro + error.message);
    }
}

module.exports = {
    validarSeguroRegistrado,
    obtenerSeguro,
    crearSeguro,
    actualizarSeguro
};
