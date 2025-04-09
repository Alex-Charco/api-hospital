const { PersonaExterna } = require("../models");
const errorMessages = require("../utils/error_messages");
const { formatFecha } = require('../utils/date_utils'); // Importa la función de formateo

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

// 🔍 Buscar persona externa por identificación
async function obtenerPersonaExternaPorIdentificacion(identificacion) {
    try {
        const personaExterna = await PersonaExterna.findOne({ where: { identificacion } });

        if (!personaExterna) {
            throw new Error(errorMessages.personaExternaNoEncontrada);
        }

        return personaExterna;
    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerPersonaExterna}: ${error.message}`);
    }
}

// 🆕 Crear nueva persona externa
async function crearPersonaExterna(datosPersona) {
    try {
        return await PersonaExterna.create(datosPersona);
    } catch (error) {
        throw new Error(`${errorMessages.errorCrearPersonaExterna}: ${error.message}`);
    }
}

// 🔄 Actualizar datos de persona externa
async function actualizarPersonaExterna(id_persona_externa, nuevosDatos) {
    try {
        const persona = await PersonaExterna.findByPk(id_persona_externa);
        if (!persona) {
            throw new Error(errorMessages.personaExternaNoEncontrada);
        }

        // Actualizar los datos
        await persona.update(nuevosDatos);

        // Convertir la instancia de Sequelize en un objeto plano
        let personaPlano = persona.toJSON();

        // 📌 Formatear la fecha antes de devolverla
        if (personaPlano.fecha_nacimiento) {
            personaPlano.fecha_nacimiento = formatFecha(personaPlano.fecha_nacimiento);
        }

        // 📌 Concatenar nombre completo eliminando valores vacíos
        personaPlano.nombre = [
            personaPlano.primer_nombre,
            personaPlano.segundo_nombre,
            personaPlano.primer_apellido,
            personaPlano.segundo_apellido
        ].filter(Boolean) // Elimina valores vacíos o null
         .join(' '); // Une los valores con un solo espacio

        // 📌 Eliminar los campos individuales de nombre
        delete personaPlano.primer_nombre;
        delete personaPlano.segundo_nombre;
        delete personaPlano.primer_apellido;
        delete personaPlano.segundo_apellido;

        return personaPlano; // 📌 Devuelve la persona sin los campos individuales de nombre
    } catch (error) {
        throw new Error(`${errorMessages.errorActualizarPersonaExterna}: ${error.message}`);
    }
}

module.exports = {
    obtenerPersonaExternaPorId,
    obtenerPersonaExternaPorIdentificacion,
    crearPersonaExterna,
    actualizarPersonaExterna
};
