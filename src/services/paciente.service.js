const { Paciente, Usuario } = require("../models");
const { verificarUsuarioExistente } = require("./user.service");
const errorMessages = require("./errorMessages");

async function validarUsuarioParaPaciente(nombre_usuario) {
    const usuario = await verificarUsuarioExistente(nombre_usuario);

    if (!usuario) {
        throw new Error(errorMessages.usuarioNoExistente);
    }
    if (usuario.id_rol !== 1) {
        throw new Error(errorMessages.usuarioNoEsPaciente);
    }

    const pacienteExistente = await Paciente.findOne({ where: { id_usuario: usuario.id_usuario } });
    if (pacienteExistente) {
        throw new Error(errorMessages.usuarioRegistradoPaciente);
    }

    return usuario;
}

async function validarIdentificacionPaciente(identificacion) {
    const paciente = await Paciente.findOne({ where: { identificacion } });
    if (paciente) {
        throw new Error(errorMessages.pacienteYaRegistrado);
    }
}

async function crearPaciente(datosPaciente) {
    try {
        return await Paciente.create(datosPaciente);
    } catch (error) {
        throw new Error("Error al crear el paciente: " + error.message);
    }
}

async function obtenerPacientePorIdentificacion(identificacion) {
    try {
        return await Paciente.findOne({ 
            where: { identificacion }, 
            include: [{ model: Usuario, as: "usuario" }] 
        });
    } catch (error) {
        throw new Error("Error al obtener el paciente: " + error.message);
    }
}

async function actualizarDatosPaciente(paciente, nuevosDatos) {
    try {
        return await paciente.update(nuevosDatos);
    } catch (error) {
        throw new Error("Error al actualizar los datos del paciente: " + error.message);
    }
}

module.exports = {
    validarUsuarioParaPaciente,
    validarIdentificacionPaciente,
    crearPaciente,
    obtenerPacientePorIdentificacion,
    actualizarDatosPaciente,
};
