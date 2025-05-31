const { Residencia, HistorialCambiosResidencia, sequelize } = require('../models');
const errorMessages = require("../utils/error_messages");

// Validar que no exista una residencia para el paciente
async function validarResidenciaRegistrada(id_paciente) {
    const residencia = await Residencia.findOne({ where: { id_paciente } });
    if (residencia) {
        throw new Error(errorMessages.residenciaYaRegistrada);
    }
}

// Obtener la residencia asociada a un paciente
async function obtenerResidencia(id_paciente) {
    const residencia = await Residencia.findOne({ where: { id_paciente } });

    if (!residencia) {
        throw new Error(errorMessages.residenciaNoEncontrada);
    }

    return residencia;
}

// Crear nueva residencia
async function crearResidencia(id_paciente, datosResidencia) {
    try {
        return await Residencia.create({
            id_paciente,
            ...datosResidencia
        });
    } catch (error) {
        throw new Error(errorMessages.errorCrearResidencia + error.message);
    }
}

// Actualizar la residencia de un paciente
async function actualizarResidencia(residencia, nuevosDatos, id_usuario) {
  if (!id_usuario) {
    throw new Error("id_usuario es obligatorio para guardar el historial de cambios");
  }

  const valoresPrevios = residencia.get({ plain: true });

  const camposAChequear = [
    'lugar_nacimiento', 'pais', 'nacionalidad',
    'provincia', 'canton', 'parroquia', 'direccion'
  ];

  const cambios = [];

  for (const campo of camposAChequear) {
    const valorAnterior = valoresPrevios[campo];
    const valorNuevo = nuevosDatos[campo];

    console.log(`🟡 Campo: ${campo}, Anterior: '${valorAnterior}', Nuevo recibido: '${valorNuevo}'`);

    if (valorNuevo !== undefined && valorAnterior?.trim() !== valorNuevo?.trim()) {
      cambios.push({
        id_residencia: residencia.id_residencia,
        campo_modificado: campo,
        valor_anterior: valorAnterior,
        valor_nuevo: valorNuevo,
        fecha_cambio: new Date(),
        id_usuario
      });
    }
  }

  try {
    return await sequelize.transaction(async (t) => {
      if (cambios.length > 0) {
        await HistorialCambiosResidencia.bulkCreate(cambios, { transaction: t });
      }

      const residenciaActualizada = await residencia.update(nuevosDatos, { transaction: t });

      return residenciaActualizada;
    });
  } catch (error) {
    throw new Error("No se pudo actualizar la residencia. " + error.message);
  }
}

module.exports = {
    validarResidenciaRegistrada,
    obtenerResidencia,
    crearResidencia,
    actualizarResidencia
};
