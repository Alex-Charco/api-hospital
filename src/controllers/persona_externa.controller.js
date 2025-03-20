const personaExternaService = require('../services/persona_externa.service');
const errorMessages = require('../utils/error_messages');
const successMessages = require('../utils/success_messages');
//const { formatFecha } = require('../utils/date_utils'); // Importa la función de formateo

// 🔍 Buscar persona externa por ID o Identificación
async function buscarPersonaExterna(req, res) {
    const { id_persona_externa, identificacion } = req.query; // <-- Se usa req.query en lugar de req.params

    try {
        let persona;
        if (id_persona_externa) {
            persona = await personaExternaService.obtenerPersonaExternaPorId(id_persona_externa);
        } else if (identificacion) {
            persona = await personaExternaService.obtenerPersonaExternaPorIdentificacion(identificacion);
        }

        if (!persona) {
            return res.status(404).json({ message: errorMessages.personaExternaNoEncontrada });
        }

        return res.status(200).json(persona);
    } catch (error) {
        console.error("❌ Error en buscarPersonaExterna:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// 🆕 Crear nueva persona externa
async function crearPersonaExterna(req, res) {
    try {
        const nuevaPersona = await personaExternaService.crearPersonaExterna(req.body);
        return res.status(201).json({
            message: successMessages.registroExitoso,
            persona: nuevaPersona
        });
    } catch (error) {
        console.error("❌ Error en crearPersonaExterna:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// 🔄 Controlador de actualización de persona externa
async function actualizarPersonaExterna(req, res) {
    const { id_persona_externa } = req.params;
    const nuevosDatos = req.body;

    try {
        const personaActualizada = await personaExternaService.actualizarPersonaExterna(id_persona_externa, nuevosDatos);

        return res.status(200).json({
            message: successMessages.informacionActualizada,
            persona: personaActualizada // 📌 Devuelve todos los datos actualizados
        });
    } catch (error) {
        console.error("❌ Error en actualizarPersonaExterna:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}



// 🔄 Actualizar datos de una persona externa
/*async function actualizarPersonaExterna(req, res) {
    const { id_persona_externa } = req.params;
    const nuevosDatos = req.body;

    try {
        const personaActualizada = await personaExternaService.actualizarPersonaExterna(id_persona_externa, nuevosDatos);

        // Convertir la instancia de Sequelize en un objeto plano
        let personaPlano = personaActualizada.toJSON();

        // 📌 Formatear la fecha antes de enviarla en la respuesta
        if (personaPlano.fecha_nacimiento) {
            personaPlano.fecha_nacimiento = formatFecha(personaPlano.fecha_nacimiento);
        }

        return res.status(200).json({
            message: successMessages.informacionActualizada,
            persona: personaPlano
        });
    } catch (error) {
        console.error("❌ Error en actualizarPersonaExterna:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}*/


// 🔄 Actualizar datos de una persona externa
/*async function actualizarPersonaExterna(req, res) {
    const { id_persona_externa } = req.params;
    const nuevosDatos = req.body;

    try {
        const personaActualizada = await personaExternaService.actualizarPersonaExterna(id_persona_externa, nuevosDatos);
        return res.status(200).json({
            message: successMessages.informacionActualizada,
            persona: personaActualizada
        });
    } catch (error) {
        console.error("❌ Error en actualizarPersonaExterna:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}*/

module.exports = {
    buscarPersonaExterna,
    crearPersonaExterna,
    actualizarPersonaExterna
};
