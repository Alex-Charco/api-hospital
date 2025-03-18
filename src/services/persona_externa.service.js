const { PersonaExterna } = require("../models");
const errorMessages = require("../utils/error_messages");

async function obtenerPersonaExternaPorId(id_persona_externa) {
    try {
        const personaExterna = await PersonaExterna.findByPk(id_persona_externa);

        if (!personaExterna) {
            throw new Error(errorMessages.personaExternaNoEncontrada);
        }

        return personaExterna;
    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerPersonaExterna}: ${error.message}`);
    }
}

module.exports = {
    obtenerPersonaExternaPorId
};
