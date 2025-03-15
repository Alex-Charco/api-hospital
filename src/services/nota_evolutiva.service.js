const { NotaEvolutiva, Cita, Paciente, Diagnostico, Procedimiento } = require('../models');
const errorMessages = require("../utils/error_messages");

// Crear una nueva nota evolutiva
/*async function crearNota({ id_cita, id_paciente, motivo_consulta, ...datosNotaEvolutiva }) {
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
}*/

async function crearNota(data, transaction) {
    try {
        return await NotaEvolutiva.create(data, { transaction });
    } catch (error) {
        throw new Error("Error al crear la nota evolutiva: " + error.message);
    }
}


// Obtener todas las notas evolutivas por ID de cita o identificación del paciente v1
/*async function obtenerNotas({ id_cita = null, identificacion = null }) {
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
}*/

// Obtener todas las notas evolutivas por ID de cita o identificación del paciente v2
async function obtenerNotasDetalladas({ id_cita = null, identificacion = null }) {
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

    // Buscar notas evolutivas con diagnósticos y procedimientos asociados
    const notas = await NotaEvolutiva.findAll({
        where: whereClause,
        include: [
            {
                model: Diagnostico,
                as: 'Diagnosticos',
                include: [
                    {
                        model: Procedimiento,
                        as: 'Procedimientos'
                    }
                ]
            }
        ]
    });

    if (!notas || notas.length === 0) {
        throw new Error(errorMessages.notaNoEncontrada);
    }

    return notas;
}

async function obtenerCitaPorId(id_cita) {
    try {
        return await Cita.findOne({ where: { id_cita } });
    } catch (error) {
        throw new Error(errorMessages.errorObtenerCita + error.message);
    }
}


// Actualizar una nota evolutiva v1
/*async function actualizarNota(id_nota_evolutiva, nuevosDatos) {
    const nota = await NotaEvolutiva.findByPk(id_nota_evolutiva);
    
    if (!nota) {
        throw new Error(errorMessages.notaNoEncontrada);
    }

    return await nota.update(nuevosDatos);
}
*/

// Actualizar una nota evolutiva v2
async function actualizarNota(id_nota_evolutiva, nuevosDatos) {
    const nota = await NotaEvolutiva.findByPk(id_nota_evolutiva, {
        include: [{
            model: Diagnostico,
            as: 'Diagnosticos',
            include: [{ model: Procedimiento, as: 'Procedimientos' }]
        }]
    });

    if (!nota) {
        throw new Error(errorMessages.notaNoEncontrada);
    }

    await nota.update(nuevosDatos);

    if (nuevosDatos.Diagnosticos && Array.isArray(nuevosDatos.Diagnosticos)) {
        for (const nuevoDiagnostico of nuevosDatos.Diagnosticos) {
            let diagnostico = await Diagnostico.findByPk(nuevoDiagnostico.id_diagnostico);
            if (diagnostico) {
                await diagnostico.update(nuevoDiagnostico);
            }

            if (nuevoDiagnostico.Procedimientos && Array.isArray(nuevoDiagnostico.Procedimientos)) {
                for (const nuevoProcedimiento of nuevoDiagnostico.Procedimientos) {
                    let procedimiento = await Procedimiento.findByPk(nuevoProcedimiento.id_procedimiento);
                    if (procedimiento) {
                        await procedimiento.update(nuevoProcedimiento);
                    }
                }
            }
        }
    }
    
    return nota;
}

module.exports = {
    crearNota,
    obtenerNotasDetalladas,
    obtenerCitaPorId,
    actualizarNota
};
