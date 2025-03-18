const { Posologia } = require('../models');

async function crearPosologia(data, transaction) {
    try {
        return await Posologia.create(data, { transaction });
    } catch (error) {
        throw new Error("Error al crear posologia: " + error.message);
    }
}

module.exports = {
    crearPosologia
};