const medicoService = require("../services/medico.service");
const { formatFecha } = require('../utils/date_utils');
const errorMessages = require('../utils/error_messages');
const successMessages = require('../utils/success_messages');

// Registrar un médico
async function registrarMedico(req, res) {
    const { 
        nombre_usuario, 
        id_especialidad, 
        identificacion, 
        fecha_nacimiento, 
        ...datosMedico 
    } = req.body;

    try {
        if (!nombre_usuario || !id_especialidad || !identificacion || !fecha_nacimiento) {
            return res.status(400).json({ message: errorMessages.faltanDatos });
        }

        if (isNaN(new Date(fecha_nacimiento))) {
            return res.status(400).json({ message: errorMessages.formatoFechaIncorrecto });
        }

        const usuarioExistente = await medicoService.validarUsuarioParaMedico(nombre_usuario);
                await medicoService.validarIdentificacionMedico(identificacion);

        const nuevoMedico = await medicoService.crearMedico({
            id_usuario: usuarioExistente.id_usuario,
            id_especialidad,
            identificacion,
            fecha_nacimiento,
            ...datosMedico
        });

        const medicoFormateado = {
            ...nuevoMedico.toJSON(),
            fecha_nacimiento: formatFecha(nuevoMedico.fecha_nacimiento)
        };

        return res.status(201).json({
            message: successMessages.registroExitoso,
            medico: medicoFormateado,
        });
    } catch (error) {
        console.warn(`Error en el registro del médico: ${error.message}`);
        return res.status(error.statusCode || 500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// Obtener un médico por identificación
async function obtenerMedicos(req, res) {
    try {
        const identificacion = req.params.identificacion || null;
        let medicos = await medicoService.obtenerMedicos(identificacion);

        if (!medicos || medicos.length === 0) {
            return res.status(404).json({ message: identificacion ? errorMessages.medicoNoEncontrado : errorMessages.medicosNoEncontrados });
        }

        // Convertir a array si solo se obtiene un médico
        if (identificacion) medicos = [medicos[0]];

        // Formatear salida
        const medicosFormateados = medicos.map(medico => ({
            ...medico.toJSON(),
            fecha_nacimiento: formatFecha(medico.fecha_nacimiento)
        }));

        return res.status(200).json({
            message: identificacion ? successMessages.medicoEncontrado : successMessages.medicosEncontrados,
            medicos: identificacion ? medicosFormateados[0] : medicosFormateados,
        });

    } catch (error) {
        console.warn(`Error al obtener médicos: ${error.message}`);
        return res.status(500).json({ message: errorMessages.errorServidor });
    }
}

// Actualizar la información de un médico
async function actualizarMedico(req, res) {
    const { identificacion } = req.params;
    const { id_usuario_modificador, ...datosActualizados } = req.body;

    try {
        const medico = await medicoService.obtenerMedicoPorIdentificacion(identificacion);

        if (!medico) {
            return res.status(404).json({ message: errorMessages.medicoNoEncontrado });
        }

        const medicoActualizado = await medicoService.actualizarDatosMedico(medico, datosActualizados, id_usuario_modificador);

        const medicoFormateado = {
            ...medicoActualizado.toJSON(),
            fecha_nacimiento: formatFecha(medicoActualizado.fecha_nacimiento)
        };

        return res.status(200).json({
            message: successMessages.informacionActualizada,
            medico: medicoFormateado
        });

    } catch (error) {
        console.warn(`Error al actualizar el médico: ${error.message}`);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = { registrarMedico, obtenerMedicos, actualizarMedico };
