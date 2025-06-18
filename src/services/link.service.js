const { Link } = require('../models');
//crea link
async function crearLink(data, transaction) {
    try {
        return await Link.create(data, { transaction });
    } catch (error) {
        throw new Error("Error al crear el link: " + error.message);
    }
}

module.exports = {
    crearLink
};
