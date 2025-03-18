const { RecetaAutorizacion } = require('../models');

async function crearRecetaAutorizacion(data, transaction) {
    try {
        return await RecetaAutorizacion.create(data, { transaction });
    } catch (error) {
        throw new Error("Error al crear receta_autorizacion: " + error.message);
    }
}

module.exports = {
    crearRecetaAutorizacion
};