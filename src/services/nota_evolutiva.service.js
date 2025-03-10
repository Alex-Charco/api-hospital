const { NotaEvolutiva, Cita, Paciente } = require('../models');
const errorMessages = require("../utils/error_messages");

// Crear una nueva nota evolutiva
async function crearNota({ id_cita, id_paciente, motivo_consulta, ...datosNotaEvolutiva }) {
    try {
        return await NotaEvolutiva.create({
            id_cita,
            id_paciente, // Guardamos el id_paciente en la nota
            motivo_consulta,
            ...datosNotaEvolutiva
        });
    } catch (error) {
        throw new Error(errorMessages.errorCrearNota + error.message);
    }
}

/*async function obtenerCitaPorId(id_cita) {
    return await Cita.findOne({ where: { id_cita } });
}

// Obtener una única nota evolutiva por ID de cita o identificación del paciente
async function obtenerNota({ id_cita = null, identificacion = null }) {
    let whereClause = {};

    if (id_cita) {
        whereClause.id_cita = id_cita;
    } else if (identificacion) {
        const paciente = await Paciente.findOne({ where: { identificacion } });

        if (!paciente) {
            throw new Error(errorMessages.pacienteNoEncontrado);
        }

        const cita = await Cita.findOne({ where: { id_paciente: paciente.id_paciente } });

        if (!cita) {
            throw new Error(errorMessages.citaNoEncontrada);
        }

        whereClause.id_cita = cita.id_cita;
    }

    const nota = await NotaEvolutiva.findOne({ where: whereClause });

    if (!nota) {
        throw new Error(errorMessages.notaNoEncontrada);
    }

    return nota;
}*/

// Obtener todas las notas evolutivas por ID de cita o identificación del paciente
async function obtenerNotas({ id_cita = null, identificacion = null }) {
    let whereClause = {};

    if (id_cita) {
        whereClause.id_cita = id_cita;
    } else if (identificacion) {
        const paciente = await Paciente.findOne({ where: { identificacion } });

        if (!paciente) {
            throw new Error(errorMessages.pacienteNoEncontrado);
        }

        const citas = await Cita.findAll({ where: { id_paciente: paciente.id_paciente } });

        if (!citas || citas.length === 0) {
            throw new Error(errorMessages.citaNoEncontrada);
        }

        const idsCitas = citas.map(cita => cita.id_cita);
        whereClause.id_cita = idsCitas;
    }

    const notas = await NotaEvolutiva.findAll({ where: whereClause });

    if (!notas || notas.length === 0) {
        throw new Error(errorMessages.notaNoEncontrada);
    }

    return notas;
}

// Actualizar una nota evolutiva
async function actualizarNota(id_nota_evolutiva, nuevosDatos) {
    const nota = await NotaEvolutiva.findByPk(id_nota_evolutiva);
    
    if (!nota) {
        throw new Error(errorMessages.notaNoEncontrada);
    }

    return await nota.update(nuevosDatos);
}

module.exports = {
    crearNota,
    obtenerNotas,
    actualizarNota
};
