const { Seguro, HistorialCambiosSeguro, sequelize } = require('../models');
const errorMessages = require("../utils/error_messages");

// Validar que el paciente no tenga ya un seguro
async function validarSeguroRegistrado(id_paciente) {
    const seguro = await Seguro.findOne({ where: { id_paciente } });
    if (seguro) {
        throw new Error(errorMessages.seguroYaRegistrado);
    }
}

// Obtener seguro asociado a un paciente
async function obtenerSeguro(id_paciente) {
    const seguro = await Seguro.findOne({ where: { id_paciente } });

    if (!seguro) {
        throw new Error(errorMessages.seguroNoEncontrado);
    }

    return seguro;
}

// Crear un nuevo seguro
async function crearSeguro(id_paciente, datosSeguro) {
    try {
        return await Seguro.create({
            id_paciente,
            ...datosSeguro
        });
    } catch (error) {
        throw new Error(errorMessages.errorCrearSeguro + error.message);
    }
}

// Actualizar seguro de un paciente
async function actualizarSeguro(seguro, nuevosDatos, id_usuario) {
    if (!id_usuario) {
        throw new Error("id_usuario es obligatorio para guardar el historial de cambios");
    }

    const valoresPrevios = seguro.get({ plain: true });

    const camposAChequear = [
        'tipo',
        'beneficiario',
        'codigo',
        'cobertura',
        'porcentaje',
        'fecha_inicio',
        'fecha_fin'
    ];

    const cambios = [];

    for (const campo of camposAChequear) {
        const valorAnterior = valoresPrevios[campo];
        const valorNuevo = nuevosDatos[campo];

        if (valorNuevo !== undefined && String(valorAnterior) !== String(valorNuevo)) {
            cambios.push({
                id_seguro: seguro.id_seguro,
                campo_modificado: campo,
                valor_anterior: valorAnterior,
                valor_nuevo: valorNuevo,
                fecha_cambio: new Date(),
                id_usuario
            });
        }
    }

    return await sequelize.transaction(async (t) => {
        if (cambios.length > 0) {
            await HistorialCambiosSeguro.bulkCreate(cambios, { transaction: t });
            console.log(`🟢 Historial seguro guardado con ${cambios.length} cambio(s).`);
        }

        const seguroActualizado = await seguro.update(nuevosDatos, { transaction: t });

        return seguroActualizado;
    });
}

module.exports = {
    validarSeguroRegistrado,
    obtenerSeguro,
    crearSeguro,
    actualizarSeguro
};
