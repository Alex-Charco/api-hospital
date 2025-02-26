const { InfoMilitar, Paciente } = require('../models');
const errorMessages = require("../utils/errorMessages");

async function validarPacienteExistente(identificacion) {
    const paciente = await Paciente.findOne({ where: { identificacion } });
    if (!paciente) {
        throw new Error(errorMessages.pacienteNoEncontrado);
    }
    return paciente;
}

async function validarPacienteMilitar(paciente) {
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
