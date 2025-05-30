const { Familiar, HistorialCambiosFamiliar } = require('../models');
const errorMessages = require("../utils/error_messages");
const { formatFechaCompleta } = require('../utils/date_utils');

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

async function actualizarDatosFamiliar(familiar, nuevosDatos, id_usuario_modificador) {
    try {
        const datosAnteriores = familiar.toJSON();
        const cambios = [];

        for (const campo in nuevosDatos) {
            if (nuevosDatos[campo] !== undefined && nuevosDatos[campo] != datosAnteriores[campo]) {
                const valorAnterior = datosAnteriores[campo] instanceof Date
                    ? datosAnteriores[campo].toISOString().split('T')[0]
                    : datosAnteriores[campo]?.toString();

                const valorNuevo = nuevosDatos[campo] instanceof Date
                    ? nuevosDatos[campo].toISOString().split('T')[0]
                    : nuevosDatos[campo]?.toString();

                cambios.push({
                    id_familiar: familiar.id_familiar,
                    id_usuario: id_usuario_modificador,
                    campo_modificado: campo,
                    valor_anterior: valorAnterior || null,
                    valor_nuevo: valorNuevo || null,
                    fecha_cambio: formatFechaCompleta(new Date())
                });
            }
        }

        if (cambios.length > 0) {
            await familiar.update(nuevosDatos);
            await HistorialCambiosFamiliar.bulkCreate(cambios);
        }

        return familiar;
    } catch (error) {
        throw new Error(`Error al actualizar datos del familiar: ${error.message}`);
    }
}

async function obtenerFamiliarPorId(id_familiar) {
    try {
        const familiar = await Familiar.findByPk(id_familiar);

        if (!familiar) {
            throw new Error(errorMessages.familiarNoEncontrado);
        }

        return familiar;
    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerFamiliar}: ${error.message}`);
    }
}

module.exports = {
    validarFamiliarRegistrado,
    obtenerFamiliarCondicional,
    obtenerFamiliarPorIdentificacion,
    crearFamiliar,
    actualizarDatosFamiliar,
	obtenerFamiliarPorId
};
