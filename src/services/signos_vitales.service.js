const {SignosVitales } = require('../models');

async function crearSignosVitales(data, transaction) {
    try {
        return await SignosVitales.create(data, { transaction });
    } catch (error) {
        throw new Error("Error al crear signos vitales: " + error.message);
    }
}

module.exports = {
    crearSignosVitales
};
