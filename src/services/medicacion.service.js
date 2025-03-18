const { Medicacion } = require('../models');

async function crearMedicacion(data, transaction) {
    try {
        return await Medicacion.create(data, { transaction });
    } catch (error) {
        throw new Error("Error al crear mmedicacion: " + error.message);
    }
}

module.exports = {
    crearMedicacion
};