const { Familiar } = require('../models');
const errorMessages = require("../utils/errorMessages");

async function validarFamiliarRegistrado(id_paciente, relacion) {
    const familiar = await Familiar.findOne({ where: { id_paciente, relacion } });
    if (familiar) {
        throw new Error(errorMessages.familiarRegistrado);
    }
}

async function obtenerFamiliarCondicional({ id_paciente = null, identificacionFamiliar = null }) {
    let whereClause = {};

    // Si se pasa id_paciente, lo usamos para buscar familiares relacionados
    if (id_paciente) {
        whereClause.id_paciente = id_paciente;
    }

    // Si se pasa identificacionFamiliar, buscamos por esa identificación
    if (identificacionFamiliar) {
        whereClause.identificacion = identificacionFamiliar;
    }

    const familiar = await Familiar.findOne({ where: whereClause });

    if (!familiar) {
        throw new Error(errorMessages.familiarNoEncontrado);
    }

    return familiar;
}

async function obtenerFamiliarPorIdentificacion(identificacionFamiliar) {
    const familiar = await Familiar.findOne({
        where: { identificacion: identificacionFamiliar }
    });

    if (!familiar) {
        throw new Error(errorMessages.familiarNoEncontrado);
    }

    return familiar;
}

async function crearFamiliar(id_paciente, datosFamiliar) {
    try {
        return await Familiar.create({
            id_paciente,
            ...datosFamiliar  // Esto propaga todos los otros datos del familiar en el objeto
        });
    } catch (error) {
        throw new Error(errorMessages.errorCrearFamiliar + error.message);
    }
}

async function actualizarFamiliar(familiar, nuevosDatos) {
    try {
        return await familiar.update(nuevosDatos);
    } catch (error) {
        throw new Error(errorMessages.errorActualizarFamiliar + error.message);
    }
}

module.exports = {
    validarFamiliarRegistrado,
    obtenerFamiliarCondicional,
    obtenerFamiliarPorIdentificacion,
    crearFamiliar,
    actualizarFamiliar
};
