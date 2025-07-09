const { Medico, Usuario, Especialidad, HistorialCambiosMedico, sequelize } = require("../models");
const { verificarUsuarioExistente } = require("./user.service");
const errorMessages = require("../utils/error_messages");
const { formatFechaCompleta } = require('../utils/date_utils');

async function validarUsuarioParaMedico(nombre_usuario) {
    try {
        const usuario = await verificarUsuarioExistente(nombre_usuario);

        if (!usuario) {
            throw new Error(errorMessages.usuarioNoExistente);
        }
        if (usuario.id_rol !== 2) {
            throw new Error(errorMessages.usuarioNoEsMedico);
        }

        const medicoExistente = await Medico.findOne({ where: { id_usuario: usuario.id_usuario } });
        if (medicoExistente) {
            throw new Error(errorMessages.usuarioRegistradoMedico);
        }

        return usuario;
    } catch (error) {
        throw new Error(`${errorMessages.errorValidarUsuario}: ${error.message}`);
    }
}

async function validarIdentificacionMedico(identificacion) {
    try {
        const medico = await Medico.findOne({ where: { identificacion } });
        if (medico) {
            throw new Error(errorMessages.medicoYaRegistrado);
        }
    } catch (error) {
        throw new Error(`${errorMessages.errorValidarIdentificacion}: ${error.message}`);
    }
}

async function crearMedico(datosMedico) {
    try {
        return await Medico.create(datosMedico);
    } catch (error) {
        throw new Error(`${errorMessages.errorCrearMedico}: ${error.message}`);
    }
}

async function obtenerMedicos(identificacion = null) {
    try {
        const condicion = identificacion ? { where: { identificacion } } : {};
        return await Medico.findAll({
            ...condicion,
            include: [
                { 
                    model: Usuario, 
                    as: "usuario",
                    attributes: ['id_usuario', 'id_rol', 'nombre_usuario', 'estatus'],
                },
                { model: Especialidad, as: "especialidad" }
            ]
        });
    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerMedicos}: ${error.message}`);
    }
}

async function actualizarDatosMedico(medico, nuevosDatos, id_usuario) {
    if (!id_usuario) {
        throw new Error("id_usuario es obligatorio para guardar el historial de cambios del médico");
    }
    try {
        const valoresPrevios = medico.get({ plain: true });
        const camposAChequear = [
            'id_especialidad', 'identificacion', 'fecha_nacimiento',
            'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
            'genero', 'reg_msp', 'celular', 'telefono', 'correo', 'estatus'
        ];
        const cambios = [];
        for (const campo of camposAChequear) {
            const valorAnterior = valoresPrevios[campo];
            const valorNuevo = nuevosDatos[campo];
            const cambioDetectado = (
                valorNuevo !== undefined &&
                String(valorAnterior)?.trim() !== String(valorNuevo)?.trim()
            );
            if (cambioDetectado) {
                cambios.push({
                    id_medico: medico.id_medico,
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
                await HistorialCambiosMedico.bulkCreate(cambios, { transaction: t });
                console.log(`🟢 Historial médico guardado con ${cambios.length} cambio(s).`);
            }
            const medicoActualizado = await medico.update(nuevosDatos, { transaction: t });
            return medicoActualizado;
        });
    } catch (error) {
        console.error("❌ Error en actualizarDatosMedico:", error.message);
        throw new Error("Error al actualizar los datos del médico y guardar el historial.");
    }
}

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

async function obtenerMedicoPorIdentificacion(identificacion) {
    try {
        return await Medico.findOne({
            where: { identificacion },
            include: [
                { 
                    model: Usuario, 
                    as: "usuario",
                    attributes: ['id_usuario', 'id_rol', 'nombre_usuario', 'estatus'],
                },
                { model: Especialidad, as: "especialidad" }
            ]
        });
    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerMedicos}: ${error.message}`);
    }
}

// Función par aobtener el historial de cambios
async function obtenerHistorialPorIdentificacionMedico(identificacion) {
  try {
    const { Medico, HistorialCambiosMedico, Usuario, Administrador } = require("../models");

    const medico = await Medico.findOne({ where: { identificacion } });

    if (!medico) {
      return null; // Esto permite devolver un mensaje amigable desde el controller
    }

    // Helper para nombre del admin
    const obtenerNombreAdministrador = (usuario) => {
      const admin = usuario?.administrador;
      return admin
        ? [admin.primer_nombre, admin.segundo_nombre, admin.primer_apellido, admin.segundo_apellido]
            .filter(Boolean)
            .join(" ")
        : "Desconocido";
    };

    // Obtener historial incluyendo quien lo hizo
    const historial = await HistorialCambiosMedico.findAll({
      where: { id_medico: medico.id_medico },
      include: [
        {
          model: Usuario,
          as: "usuario",
          required: false,
          include: [
            {
              model: Administrador,
              as: "administrador",
              attributes: [
                "primer_nombre",
                "segundo_nombre",
                "primer_apellido",
                "segundo_apellido"
              ],
              required: false
            }
          ]
        }
      ],
      order: [["fecha_cambio", "DESC"]]
    });

    const historialFormateado = historial.map((item) => {
      const json = item.toJSON();
      json.fecha_cambio = formatFechaCompleta(json.fecha_cambio);
      json.realizado_por = obtenerNombreAdministrador(item.usuario);
      return json;
    });

    return {
      datos_medico: {
        identificacion: medico.identificacion,
        primer_nombre: medico.primer_nombre,
        segundo_nombre: medico.segundo_nombre,
        primer_apellido: medico.primer_apellido,
        segundo_apellido: medico.segundo_apellido,
        celular: medico.celular,
        correo: medico.correo
      },
      historial: historialFormateado
    };

  } catch (error) {
    throw new Error(`Error al obtener historial por identificación: ${error.message}`);
  }
}

module.exports = {
    validarUsuarioParaMedico,
    validarIdentificacionMedico,
    crearMedico,
    obtenerMedicos,
    actualizarDatosMedico,
    validarMedicoExistente,
	obtenerMedicoPorIdentificacion,
	obtenerHistorialPorIdentificacionMedico
};
