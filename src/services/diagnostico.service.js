const {Diagnostico } = require('../models');

async function crearDiagnostico(data, transaction) {
    try {
        return await Diagnostico.create(data, { transaction });
    } catch (error) {
        throw new Error("Error al crear diagnóstico: " + error.message);
    }
}

module.exports = {
    crearDiagnostico
};