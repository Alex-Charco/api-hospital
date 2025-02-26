const { Paciente, Usuario } = require("../models");
const { verificarUsuarioExistente } = require("./user.service");

async function validarUsuarioParaPaciente(nombre_usuario) {
    const usuario = await verificarUsuarioExistente(nombre_usuario);

    if (!usuario) {
        throw new Error("El usuario ingresado no existe.");
    }
    if (usuario.id_rol !== 1) {
        throw new Error("El usuario no tiene el rol de PACIENTE.");
    }

    const pacienteExistente = await Paciente.findOne({ where: { id_usuario: usuario.id_usuario } });
    if (pacienteExistente) {
        throw new Error("Este usuario ya está registrado como paciente.");
    }

    return usuario;
}

async function validarIdentificacionPaciente(identificacion) {
    const paciente = await Paciente.findOne({ where: { identificacion } });
    if (paciente) {
        throw new Error("Ya existe un paciente con esta identificación.");
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
