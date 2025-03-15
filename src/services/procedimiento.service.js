const {Procedimiento } = require('../models');

async function crearProcedimiento(data, transaction) {
    try {
        return await Procedimiento.create(data, { transaction });
    } catch (error) {
        throw new Error("Error al crear procedimiento: " + error.message);
    }
}

module.exports = {
    crearProcedimiento
};