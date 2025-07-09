const { 
	Paciente, 
	Usuario, 
	RolUsuario, 
	Familiar, 
	InfoMilitar, 
	Residencia, 
	Seguro, 
	HistorialCambiosPaciente,
	Cita,
	Turno,
	Horario,
	Medico, 
	Especialidad
} = require("../models");
const { verificarUsuarioExistente } = require("./user.service");
const errorMessages = require("../utils/error_messages");
const { formatFechaCompleta } = require('../utils/date_utils');
const { getEdad, getGrupoEtario } = require("../utils/edad_utils");

async function validarUsuarioParaPaciente(nombre_usuario) {
    try {
        const usuario = await verificarUsuarioExistente(nombre_usuario);

        if (!usuario) {
            throw new Error(errorMessages.usuarioNoExistente);
        }
        if (usuario.id_rol !== 1) {
            throw new Error(errorMessages.usuarioNoEsPaciente);
        }

        const pacienteExistente = await Paciente.findOne({ where: { id_usuario: usuario.id_usuario } });
        if (pacienteExistente) {
            throw new Error(errorMessages.usuarioRegistradoPaciente);
        }

        return usuario;
    } catch (error) {
        throw new Error(`${errorMessages.errorValidarUsuario}: ${error.message}`);
    }
}

async function validarIdentificacionPaciente(identificacion) {
    try {
        const paciente = await Paciente.findOne({ where: { identificacion } });
        if (paciente) {
            throw new Error(errorMessages.pacienteYaRegistrado);
        }
    } catch (error) {
        throw new Error(`${errorMessages.errorValidarIdentificacion}: ${error.message}`);
    }
}

async function crearPaciente(datosPaciente) {
    try {
        return await Paciente.create(datosPaciente);
    } catch (error) {
        throw new Error(`${errorMessages.errorCrearPaciente}: ${error.message}`);
    }
}

async function obtenerPacientePorIdentificacion(identificacion) {
    try {
        return await Paciente.findOne({ 
            where: { identificacion }, 
            include: [
				{ 
					model: Usuario, 
					as: "usuario",
                    include: [
                        {
                            model: RolUsuario,
                            as: "rol" 
                        }
                    ]
                },
				{
					model: Familiar,
					as: "familiares"
				},
				{
					model: InfoMilitar,
				},
				{
					model: Residencia,
					as: "residencia"
				},
				{
					model: Seguro
				}
				] 
        });
    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerPaciente}: ${error.message}`);
    }
}

function procesarValor(valor) {
    if (valor === null || valor === undefined) return null;
    if (valor instanceof Date) return valor.toISOString().split("T")[0];
    if (typeof valor === "object") {
        try {
            return JSON.stringify(valor);
        } catch {
            return "[objeto no serializable]";
        }
    }
    return valor.toString();
}

async function actualizarDatosPaciente(paciente, nuevosDatos, id_usuario_modificador) {
    try {
        const datosAnteriores = paciente.toJSON();
        const cambios = [];

        // Campos que no deben registrarse aquí porque tienen historial propio
        const camposIgnorados = ["usuario", "familiares", "InfoMilitar", "residencia", "Seguro"];

        for (const campo in nuevosDatos) {
			if (camposIgnorados.includes(campo)) continue;

			const valorNuevoRaw = nuevosDatos[campo];
			const valorAnteriorRaw = datosAnteriores[campo];

			// Evitar guardar si valorAnterior es null/undefined pero valorNuevo no (porque no hubo cambio real)
			if (valorAnteriorRaw === null || valorAnteriorRaw === undefined) {
				// Si el valor anterior no existe, pero el valor nuevo sí, y no cambió en realidad (ejemplo, ambos vacíos), lo ignoramos
				// O bien, solo guardamos si quieres registrar creación de ese campo por primera vez
				continue; 
			}

			// Normalización para fechas (como antes)...

			let valorNuevo = valorNuevoRaw;
			let valorAnterior = valorAnteriorRaw;

			if (valorNuevoRaw instanceof Date || (typeof valorNuevoRaw === 'string' && Date.parse(valorNuevoRaw))) {
				valorNuevo = new Date(valorNuevoRaw).toISOString().split('T')[0];
				valorAnterior = valorAnteriorRaw ? new Date(valorAnteriorRaw).toISOString().split('T')[0] : null;
			}

			if (valorNuevo !== undefined && valorNuevo != valorAnterior) {
				cambios.push({
					id_paciente: paciente.id_paciente,
					id_usuario: id_usuario_modificador,
					campo_modificado: campo,
					valor_anterior: procesarValor(valorAnteriorRaw),
					valor_nuevo: procesarValor(valorNuevoRaw),
					fecha_cambio: formatFechaCompleta(new Date())
				});
			}
		}

        if (cambios.length > 0) {
            await paciente.update(nuevosDatos);
            await HistorialCambiosPaciente.bulkCreate(cambios);
        }

        return paciente;
    } catch (error) {
        throw new Error(`Error al actualizar datos del paciente: ${error.message}`);
    }
}

async function obtenerPacientePorId(id_paciente) {
    try {
        const paciente = await Paciente.findByPk(id_paciente, {
            include: [
				{ 
					model: Usuario, 
					as: "usuario" },
					
					]
        });

        if (!paciente) {
            throw new Error(errorMessages.pacienteNoEncontrado);
        }

        return paciente;
    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerPaciente}: ${error.message}`);
    }
}

async function obtenerPacientePorIdUsuario(id_usuario) {
    try {
        return await Paciente.findOne({
            where: { id_usuario },
            include: [{ model: Usuario, as: "usuario" }]
        });
    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerPaciente}: ${error.message}`);
    }
}

async function obtenerHistorialPorIdentificacion(identificacion) {
  try {
    const {
      Paciente, Familiar, HistorialCambiosPaciente, HistorialCambiosFamiliar,
      InfoMilitar, HistorialCambiosInfoMilitar,
      Residencia, HistorialCambiosResidencia,
      Seguro, HistorialCambiosSeguro,
      Usuario, Administrador
    } = require("../models");

    const paciente = await Paciente.findOne({
      where: { identificacion },
      include: [{ model: Familiar, as: "familiares" }]
    });

    if (!paciente) throw new Error("Paciente no encontrado con esa identificación.");

    const obtenerNombreAdministrador = (usuario) => {
      const admin = usuario?.administrador;
      return admin
        ? [admin.primer_nombre, admin.segundo_nombre, admin.primer_apellido, admin.segundo_apellido].filter(Boolean).join(" ")
        : "Desconocido";
    };

    const convertirValores = (json) => {
      if (typeof json.valor_anterior === "object" && json.valor_anterior !== null) {
        json.valor_anterior = JSON.stringify(json.valor_anterior, null, 2);
      }
      if (typeof json.valor_nuevo === "object" && json.valor_nuevo !== null) {
        json.valor_nuevo = JSON.stringify(json.valor_nuevo, null, 2);
      }
      return json;
    };

    // ---------------------- PACIENTE ----------------------
    const historialPaciente = await HistorialCambiosPaciente.findAll({
      where: { id_paciente: paciente.id_paciente },
      include: [{
        model: Usuario,
        as: "usuario",
        required: false,
        include: [{
          model: Administrador,
          as: "administrador",
          attributes: ["primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido"],
          required: false
        }]
      }],
      order: [["fecha_cambio", "DESC"]]
    });

    const historialPacienteFormateado = historialPaciente.map(item => {
      const json = item.toJSON();
      json.tipo = "paciente";
      json.fecha_cambio = formatFechaCompleta(json.fecha_cambio);
      json.realizado_por = obtenerNombreAdministrador(item.usuario);
      return convertirValores(json);
    });

    // ---------------------- FAMILIAR ----------------------
    const familiares = paciente.familiares || [];
    let historialFamiliarTotal = [];

    for (const familiar of familiares) {
      const historialFamiliar = await HistorialCambiosFamiliar.findAll({
        where: { id_familiar: familiar.id_familiar },
        include: [{
          model: Usuario,
          as: "usuario",
          required: false,
          include: [{
            model: Administrador,
            as: "administrador",
            attributes: ["primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido"],
            required: false
          }]
        }],
        order: [["fecha_cambio", "DESC"]]
      });

      const formateado = historialFamiliar.map(item => {
        const json = item.toJSON();
        json.tipo = "familiar";
        json.id_familiar = familiar.id_familiar;
        json.fecha_cambio = formatFechaCompleta(json.fecha_cambio);
        json.realizado_por = obtenerNombreAdministrador(item.usuario);
        return convertirValores(json);
      });

      historialFamiliarTotal = historialFamiliarTotal.concat(formateado);
    }

    // ---------------------- INFO MILITAR ----------------------
    const infoMilitar = await InfoMilitar.findOne({
      where: { id_paciente: paciente.id_paciente }
    });

    let historialInfoMilitarFormateado = [];
    if (infoMilitar) {
      const historialInfoMilitar = await HistorialCambiosInfoMilitar.findAll({
        where: { id_info_militar: infoMilitar.id_info_militar },
        include: [{
          model: Usuario,
          as: "usuario",
          required: false,
          include: [{
            model: Administrador,
            as: "administrador",
            attributes: ["primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido"],
            required: false
          }]
        }],
        order: [["fecha_cambio", "DESC"]]
      });

      historialInfoMilitarFormateado = historialInfoMilitar.map(item => {
        const json = item.toJSON();
        json.tipo = "info_militar";
        json.fecha_cambio = formatFechaCompleta(json.fecha_cambio);
        json.realizado_por = obtenerNombreAdministrador(item.usuario);
        return convertirValores(json);
      });
    }

    // ---------------------- RESIDENCIA ----------------------
    const residencia = await Residencia.findOne({
      where: { id_paciente: paciente.id_paciente }
    });

    let historialResidenciaFormateado = [];
    if (residencia) {
      const historialResidencia = await HistorialCambiosResidencia.findAll({
        where: { id_residencia: residencia.id_residencia },
        include: [{
          model: Usuario,
          as: "usuario",
          required: false,
          include: [{
            model: Administrador,
            as: "administrador",
            attributes: ["primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido"],
            required: false
          }]
        }],
        order: [["fecha_cambio", "DESC"]]
      });

      historialResidenciaFormateado = historialResidencia.map(item => {
        const json = item.toJSON();
        json.tipo = "residencia";
        json.fecha_cambio = formatFechaCompleta(json.fecha_cambio);
        json.realizado_por = obtenerNombreAdministrador(item.usuario);
        return convertirValores(json);
      });
    }

    // ---------------------- SEGURO ----------------------
    const seguro = await Seguro.findOne({
      where: { id_paciente: paciente.id_paciente }
    });

    let historialSeguroFormateado = [];
    if (seguro) {
      const historialSeguro = await HistorialCambiosSeguro.findAll({
        where: { id_seguro: seguro.id_seguro },
        include: [{
          model: Usuario,
          as: "usuario",
          required: false,
          include: [{
            model: Administrador,
            as: "administrador",
            attributes: ["primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido"],
            required: false
          }]
        }],
        order: [["fecha_cambio", "DESC"]]
      });

      historialSeguroFormateado = historialSeguro.map(item => {
        const json = item.toJSON();
        json.tipo = "seguro";
        json.fecha_cambio = formatFechaCompleta(json.fecha_cambio);
        json.realizado_por = obtenerNombreAdministrador(item.usuario);
        return convertirValores(json);
      });
    }

    return {
      datos_paciente: {
        identificacion: paciente.identificacion,
        primer_nombre: paciente.primer_nombre,
        segundo_nombre: paciente.segundo_nombre,
        primer_apellido: paciente.primer_apellido,
        segundo_apellido: paciente.segundo_apellido,
        celular: paciente.celular,
        correo: paciente.correo
      },
      paciente: historialPacienteFormateado,
      familiares: historialFamiliarTotal,
      info_militar: historialInfoMilitarFormateado,
      residencia: historialResidenciaFormateado,
      seguro: historialSeguroFormateado
    };

  } catch (error) {
    throw new Error(`Error al obtener historial por identificación: ${error.message}`);
  }
}

// Función auxiliar para concatenar nombres evitando espacios dobles
function construirNombreCompleto(...nombres) {
    return nombres.filter(n => n && n.trim() !== '').join(' ');
}

async function obtenerDetallePacientePorCita(id_cita) {
    try {
        if (!id_cita) {
            throw new Error("Se requiere el id_cita");
        }

        const cita = await Cita.findOne({
            where: { id_cita },
            include: [
                {
                    model: Turno,
                    as: 'turno',
                    include: [
                        {
                            model: Horario,
                            as: 'horario',
                            include: [
                                {
                                    model: Medico,
                                    as: 'medico',
                                    include: [
                                        { model: Especialidad, as: 'especialidad' }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Paciente,
                    as: 'paciente'
                }
            ]
        });

        if (!cita) {
            throw new Error(errorMessages.citaNoEncontrada);
        }

        const paciente = cita.paciente;
        if (!paciente) {
            throw new Error(errorMessages.pacienteNoEncontrado);
        }

        const seguro = await Seguro.findOne({ where: { id_paciente: paciente.id_paciente } });

        const edad = getEdad(paciente.fecha_nacimiento);
        const grupo_etario = getGrupoEtario(edad);

        const medico = cita.turno?.horario?.medico;
        const especialidad = medico?.especialidad;

        return {
            identificacion: paciente.identificacion,
            nombres: construirNombreCompleto(
                paciente.primer_nombre,
                paciente.segundo_nombre,
                paciente.primer_apellido,
                paciente.segundo_apellido
            ),
            fecha_nacimiento: paciente.fecha_nacimiento,
            genero: paciente.genero,
            estado_civil: paciente.estado_civil,
            edad,
            grupo_etario,
            seguro: seguro ? {
                tipo: seguro.tipo,
                beneficiario: seguro.beneficiario,
                codigo_seguro: seguro.codigo
            } : null,
            medico: medico ? {
                nombres_medico: construirNombreCompleto(
                    medico.primer_nombre,
                    medico.segundo_nombre,
                    medico.primer_apellido,
                    medico.segundo_apellido
                ),
                especialidad: especialidad?.nombre || null
            } : null
        };

    } catch (error) {
        throw new Error(`${errorMessages.errorObtenerPaciente}: ${error.message}`);
    }
}

module.exports = {
    validarUsuarioParaPaciente,
    validarIdentificacionPaciente,
    crearPaciente,
    obtenerPacientePorIdentificacion,
    actualizarDatosPaciente,
	obtenerPacientePorId,
	obtenerPacientePorIdUsuario,
    obtenerHistorialPorIdentificacion,
	obtenerDetallePacientePorCita
};
