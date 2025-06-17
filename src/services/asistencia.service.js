const { Asistencia, Cita } = require('../models');

const findByCitaId = async (id_cita) => {
    return await Asistencia.findOne({
        where: { id_cita },
        include: {
            model: Cita,
            as: 'cita'
        }
    });
};

const ESTADOS_VALIDOS = ['CONFIRMADA', 'CANCELADA', 'REAGENDADA', 'NO_ASISTIO'];

const crearAsistencia = async (data) => {
    const { id_cita, estado_asistencia, comentario } = data;

    // Validaciones
    if (!id_cita || typeof id_cita !== 'number' || id_cita <= 0) {
        throw new Error('El campo "id_cita" es obligatorio y debe ser un número positivo.');
    }

    if (!estado_asistencia || !ESTADOS_VALIDOS.includes(estado_asistencia)) {
        throw new Error(`El campo "estado_asistencia" es obligatorio y debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }

    if (comentario && comentario.length > 600) {
        throw new Error('El campo "comentario" no puede exceder los 600 caracteres.');
    }

    // Validar que la cita exista
    const citaExistente = await Cita.findByPk(id_cita);
    if (!citaExistente) {
        throw new Error('No se encontró la cita con el ID proporcionado.');
    }

    // Validar que no exista otra asistencia
    const asistenciaExistente = await Asistencia.findOne({ where: { id_cita } });
    if (asistenciaExistente) {
        throw new Error('Ya existe una asistencia registrada para esta cita.');
    }

    // Crear la asistencia (sin enviar fecha_asistencia, Sequelize/DB la asigna)
    const nuevaAsistencia = await Asistencia.create({
        id_cita,
        estado_asistencia,
        comentario
    });

    return nuevaAsistencia;
};

module.exports = {
    findByCitaId,
	crearAsistencia
};
