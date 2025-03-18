const { Medicamento } = require('../models');

async function crearMedicamento(data, transaction) {
    try {
        return await Medicamento.create(data, { transaction });
    } catch (error) {
        throw new Error("Error al crear medicamento: " + error.message);
    }
}

module.exports = {
    crearMedicamento
};