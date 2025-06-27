const {SignoVital } = require('../models');

async function crearSignoVital(data, transaction) {
    try {
        return await SignoVital.create(data, { transaction });
    } catch (error) {
        throw new Error("Error al crear signos vitales: " + error.message);
    }
}

module.exports = {
    crearSignoVital
};
