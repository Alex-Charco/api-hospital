const { Residencia } = require('../models');
const errorMessages = require("../utils/error_messages");

// Validar que no exista una residencia para el paciente
async function validarResidenciaRegistrada(id_paciente) {
    const residencia = await Residencia.findOne({ where: { id_paciente } });
    if (residencia) {
        throw new Error(errorMessages.residenciaYaRegistrada);
    }
}

// Obtener la residencia asociada a un paciente
async function obtenerResidencia(id_paciente) {
    const residencia = await Residencia.findOne({ where: { id_paciente } });

    if (!residencia) {
        throw new Error(errorMessages.residenciaNoEncontrada);
    }

    return residencia;
}

// Crear nueva residencia
async function crearResidencia(id_paciente, datosResidencia) {
    try {
        return await Residencia.create({
            id_paciente,
            ...datosResidencia
        });
    } catch (error) {
        throw new Error(errorMessages.errorCrearResidencia + error.message);
    }
}

// Actualizar la residencia de un paciente
async function actualizarResidencia(residencia, nuevosDatos) {
    try {
        return await residencia.update(nuevosDatos);
    } catch (error) {
        throw new Error(errorMessages.errorActualizarResidencia + error.message);
    }
}

module.exports = {
    validarResidenciaRegistrada,
    obtenerResidencia,
    crearResidencia,
    actualizarResidencia
};
