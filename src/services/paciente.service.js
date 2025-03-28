const { Paciente, Usuario } = require("../models");
const { verificarUsuarioExistente } = require("./user.service");
const errorMessages = require("../utils/error_messages");

async function validarUsuarioParaPaciente(nombre_usuario) {
    try {
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
    } catch (error) {
        throw new Error(`${errorMessages.errorValidarUsuario}: ${error.message}`);
    }
}


async function validarIdentificacionPaciente(identificacion) {
    try {
        const paciente = await Paciente.findOne({ where: { identificacion } });
        if (paciente) {
            throw new Error(errorMessages.pacienteYaRegistrado);
        }
    } catch (error) {
        throw new Error(`${errorMessages.errorValidarIdentificacion}: ${error.message}`);
    }
}

async function crearPaciente(datosPaciente) {
    try {
        return await Paciente.create(datosPaciente);
    } catch (error) {
        throw new Error(`${errorMessages.errorCrearPaciente}: ${error.message}`);
    }
}

async function obtenerPacientePorIdentificacion(identificacion) {
    try {
        return await Paciente.findOne({ 
            where: { identificacion }, 
            include: [{ model: Usuario, as: "usuario" }] 
        });
    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerPaciente}: ${error.message}`);
    }
}

async function actualizarDatosPaciente(paciente, nuevosDatos) {
    try {
        return await paciente.update(nuevosDatos);
    } catch (error) {
        throw new Error(`${errorMessages.errorActualizarPaciente}: ${error.message}`);
    }
}

async function obtenerPacientePorId(id_paciente) {
    try {
        const paciente = await Paciente.findByPk(id_paciente, {
            include: [{ model: Usuario, as: "usuario" }]
        });

        if (!paciente) {
            throw new Error(errorMessages.pacienteNoEncontrado);
        }

        return paciente;
    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerPaciente}: ${error.message}`);
    }
}

async function obtenerPacientePorIdUsuario(id_usuario) {
    try {
        return await Paciente.findOne({
            where: { id_usuario },
            include: [{ model: Usuario, as: "usuario" }]
        });
    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerPaciente}: ${error.message}`);
    }
}

module.exports = {
    validarUsuarioParaPaciente,
    validarIdentificacionPaciente,
    crearPaciente,
    obtenerPacientePorIdentificacion,
    actualizarDatosPaciente,
	obtenerPacientePorId,
	obtenerPacientePorIdUsuario
};
