const { Medico } = require('../models'); 
const errorMessages = require("../utils/error_messages");

// Función para validar si un médico existe en la base de datos
async function validarMedicoExistente(identificacion) {
    try {
        const medico = await Medico.findOne({ where: { identificacion } });

        if (!medico) {
            return null;
        }

        return medico; 
    } catch (error) {
        console.error("❌ Error en validarMedicoExistente:", error.message);
        throw new Error(errorMessages.errorServidor);
    }
}

module.exports = {
    validarMedicoExistente
};
