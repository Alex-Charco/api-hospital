const { InfoMilitar, Paciente, HistorialCambiosInfoMilitar, sequelize } = require('../models');
const errorMessages = require("../utils/error_messages");

async function validarPacienteExistente(identificacion) {
    try {
        const paciente = await Paciente.findOne({ where: { identificacion } });
        
        // Si no encuentra el paciente, devuelve null en lugar de lanzar un error
        if (!paciente) {
            return null;
        }

        return paciente; 
    } catch (error) {
        console.warn("Error en validarPacienteExistente:", error.message);
        throw new Error(errorMessages.errorValidarPaciente);
    }
}


async function validarPacienteMilitar(paciente) {
    console.log("📌 Datos del paciente en validarPacienteMilitar:", paciente);
    if (paciente.tipo_paciente !== 'MILITAR') {
        throw new Error(errorMessages.pacienteMilitar);
    }
}

async function validarInfoMilitarNoRegistrada(id_paciente) {
    const infoMilitar = await InfoMilitar.findOne({ where: { id_paciente } });
    if (infoMilitar) {
        throw new Error(errorMessages.infoMilitarRegistrada);
    }
}

async function obtenerInfoMilitar(id_paciente) {
    const infoMilitar = await InfoMilitar.findOne({ where: { id_paciente } });
    if (!infoMilitar) {
        throw new Error(errorMessages.infoMilitarNoEncontrada);
    }
    return infoMilitar;
}

async function crearInfoMilitar(id_paciente, datosMilitares) {
    return await InfoMilitar.create({ id_paciente, ...datosMilitares });
}

async function actualizarInfoMilitar(infoMilitar, nuevosDatos, id_usuario) {
  if (!id_usuario) {
    throw new Error("id_usuario es obligatorio para guardar el historial de cambios");
  }

  const valoresPrevios = infoMilitar.get({ plain: true });

  const camposAChequear = ['cargo', 'grado', 'fuerza', 'unidad'];
  const cambios = [];

  for (const campo of camposAChequear) {
    const valorAnterior = valoresPrevios[campo];
    const valorNuevo = nuevosDatos[campo];

    // 🔍 Debug: mostrar valores comparados antes de actualizar
    console.log(`🟡 Campo: ${campo}, Anterior: '${valorAnterior}', Nuevo recibido: '${valorNuevo}'`);

    if (valorNuevo !== undefined && valorAnterior?.trim() !== valorNuevo?.trim()) {
      cambios.push({
        id_info_militar: infoMilitar.id_info_militar,
        id_usuario,
        campo_modificado: campo,
        valor_anterior: valorAnterior,
        valor_nuevo: valorNuevo,
        fecha_cambio: new Date()
      });
    }
  }

  return await sequelize.transaction(async (t) => {
    // 1. Guardamos el historial de cambios primero
    if (cambios.length > 0) {
      await HistorialCambiosInfoMilitar.bulkCreate(cambios, { transaction: t });
      console.log(`🟢 Historial guardado con ${cambios.length} cambio(s).`);
    }

    // 2. Luego actualizamos la tabla info_militar
    const infoMilitarActualizado = await infoMilitar.update(nuevosDatos, { transaction: t });

    return infoMilitarActualizado;
  });
}

module.exports = {
    validarPacienteExistente,
    validarPacienteMilitar,
    validarInfoMilitarNoRegistrada,
    obtenerInfoMilitar,
    crearInfoMilitar,
    actualizarInfoMilitar
};
