const { Medico, Usuario, Especialidad } = require("../models");
const { verificarUsuarioExistente } = require("./user.service");
const errorMessages = require("../utils/error_messages");

async function validarUsuarioParaMedico(nombre_usuario) {
    try {
        const usuario = await verificarUsuarioExistente(nombre_usuario);

        if (!usuario) {
            throw new Error(errorMessages.usuarioNoExistente);
        }
        if (usuario.id_rol !== 2) {
            throw new Error(errorMessages.usuarioNoEsMedico);
        }

        const medicoExistente = await Medico.findOne({ where: { id_usuario: usuario.id_usuario } });
        if (medicoExistente) {
            throw new Error(errorMessages.usuarioRegistradoMedico);
        }

        return usuario;
    } catch (error) {
        throw new Error(`${errorMessages.errorValidarUsuario}: ${error.message}`);
    }
}


async function validarIdentificacionMedico(identificacion) {
    try {
        const medico = await Medico.findOne({ where: { identificacion } });
        if (medico) {
            throw new Error(errorMessages.medicoYaRegistrado);
        }
    } catch (error) {
        throw new Error(`${errorMessages.errorValidarIdentificacion}: ${error.message}`);
    }
}

async function crearMedico(datosMedico) {
    try {
        return await Medico.create(datosMedico);
    } catch (error) {
        throw new Error(`${errorMessages.errorCrearMedico}: ${error.message}`);
    }
}

async function obtenerMedicos(identificacion = null) {
    try {
        const condicion = identificacion ? { where: { identificacion } } : {};
        return await Medico.findAll({
            ...condicion,
            include: [
                { 
                    model: Usuario, 
                    as: "usuario",
                    attributes: ['id_usuario', 'id_rol', 'nombre_usuario', 'estatus'],
                },
                { model: Especialidad, as: "especialidad" }
            ]
        });
    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerMedicos}: ${error.message}`);
    }
}

async function actualizarDatosMedico(medico, nuevosDatos) {
    try {
        return await medico.update(nuevosDatos);
    } catch (error) {
        throw new Error(`${errorMessages.errorActualizarMedico}: ${error.message}`);
    }
}

// Función para validar si un médico existe en la base de datos
async function validarMedicoExistente(identificacion) {
    try {
        const medico = await Medico.findOne({ where: { identificacion } });

        if (!medico) {
            return null;
        }

        return medico; 
    } catch (error) {
        console.error("❌ Error en validarMedicoExistente:", error.message);
        throw new Error(errorMessages.errorServidor);
    }
}

async function obtenerMedicoPorIdentificacion(identificacion) {
    try {
        return await Medico.findOne({
            where: { identificacion },
            include: [
                { 
                    model: Usuario, 
                    as: "usuario",
                    attributes: ['id_usuario', 'id_rol', 'nombre_usuario', 'estatus'],
                },
                { model: Especialidad, as: "especialidad" }
            ]
        });
    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerMedicos}: ${error.message}`);
    }
}


module.exports = {
    validarUsuarioParaMedico,
    validarIdentificacionMedico,
    crearMedico,
    obtenerMedicos,
    actualizarDatosMedico,
    validarMedicoExistente,
	obtenerMedicoPorIdentificacion
};
