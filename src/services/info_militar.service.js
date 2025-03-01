const { InfoMilitar, Paciente } = require('../models');
const errorMessages = require("../utils/error_messages");

async function validarPacienteExistente(identificacion) {
    try {
        const paciente = await Paciente.findOne({ where: { identificacion } });
        
        // Si no encuentra el paciente, devuelve null en lugar de lanzar un error
        if (!paciente) {
            return null;
        }

        return paciente; 
    } catch (error) {
        console.warn("Error en validarPacienteExistente:", error.message);
        throw new Error(errorMessages.errorValidarPaciente);
    }
}


async function validarPacienteMilitar(paciente) {
    console.log("📌 Datos del paciente en validarPacienteMilitar:", paciente);
    if (paciente.tipo_paciente !== 'MILITAR') {
        throw new Error(errorMessages.pacienteMilitar);
    }
}

async function validarInfoMilitarNoRegistrada(id_paciente) {
    const infoMilitar = await InfoMilitar.findOne({ where: { id_paciente } });
    if (infoMilitar) {
        throw new Error(errorMessages.infoMilitarRegistrada);
    }
}

async function obtenerInfoMilitar(id_paciente) {
    const infoMilitar = await InfoMilitar.findOne({ where: { id_paciente } });
    if (!infoMilitar) {
        throw new Error(errorMessages.infoMilitarNoEncontrada);
    }
    return infoMilitar;
}

async function crearInfoMilitar(id_paciente, datosMilitares) {
    return await InfoMilitar.create({ id_paciente, ...datosMilitares });
}

async function actualizarInfoMilitar(infoMilitar, nuevosDatos) {
    return await infoMilitar.update(nuevosDatos);
}

module.exports = {
    validarPacienteExistente,
    validarPacienteMilitar,
    validarInfoMilitarNoRegistrada,
    obtenerInfoMilitar,
    crearInfoMilitar,
    actualizarInfoMilitar
};
