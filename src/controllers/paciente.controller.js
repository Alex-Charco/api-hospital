const pacienteService = require("../services/paciente.service");
const { formatFechaNacimiento } = require('../utils/date_utils');
const errorMessages = require('../utils/error_messages');
const successMessages = require('../utils/success_messages');

// Función para registrar un paciente
async function registrarPaciente(req, res) {
    const {
        nombre_usuario,
        identificacion,
        fecha_nacimiento,
        ...datosPaciente
    } = req.body;

    try {
        if (!nombre_usuario || !identificacion || !fecha_nacimiento) {
            return res.status(400).json({ message: errorMessages.faltanDatos });
        }

        if (isNaN(new Date(fecha_nacimiento))) {
            return res.status(400).json({ message: errorMessages.formatoFechaIncorrecto });
        }

        const usuarioExistente = await pacienteService.validarUsuarioParaPaciente(nombre_usuario);
        await pacienteService.validarIdentificacionPaciente(identificacion);

        // Crear el nuevo paciente
        const nuevoPaciente = await pacienteService.crearPaciente({
            id_usuario: usuarioExistente.id_usuario,
            identificacion,
            fecha_nacimiento,
            ...datosPaciente
        });

        // Formatear la fecha antes de devolver la respuesta
        const pacienteFormateado = {
            ...nuevoPaciente.toJSON(),
            fecha_nacimiento: formatFechaNacimiento(nuevoPaciente.fecha_nacimiento)
        };

        // Devolver todos los datos registrados del paciente
        return res.status(201).json({
            message: successMessages.registroExitoso,
            paciente: pacienteFormateado,
        });
    } catch (error) {
        // Cambiar console.error() por una forma más controlada
        console.warn(`Error en el registro del paciente: ${error.message}`);
        return res.status(error.statusCode || 500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// Función para obtener un paciente por identificación
async function getPaciente(req, res) {
    try {
        // Buscar al paciente por identificación
        const paciente = await pacienteService.obtenerPacientePorIdentificacion(req.params.identificacion);

        if (!paciente) {
            return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });
        }

        // Formatear la fecha de nacimiento antes de devolverla
        const pacienteFormateado = {
            ...paciente.toJSON(),
            fecha_nacimiento: formatFechaNacimiento(paciente.fecha_nacimiento)
        };

        // Devolver los datos del paciente
        return res.status(200).json({
            message: successMessages.pacienteEncontrado,
            paciente: pacienteFormateado,
        });
    } catch (error) {
        console.warn(`Error al obtener el paciente: ${error.message}`);
        return res.status(500).json({ message: errorMessages.errorServidor });
    }
}

// Función para actualizar la información del paciente
async function actualizarPaciente(req, res) {
    const { identificacion } = req.params; 
    const datosActualizados = req.body;
    try {
        // Buscar al paciente por identificación
        const paciente = await pacienteService.obtenerPacientePorIdentificacion(identificacion);

        if (!paciente) {
            return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });
        }

        // Actualizar los datos del paciente
        const pacienteActualizado = await pacienteService.actualizarDatosPaciente(paciente, datosActualizados);

        // Formatear la fecha de nacimiento antes de devolverla
        const pacienteFormateado = {
            ...pacienteActualizado.toJSON(),
            fecha_nacimiento: formatFechaNacimiento(pacienteActualizado.fecha_nacimiento)
        };

        // Devolver los datos actualizados del paciente
        return res.status(200).json({
            message: successMessages.informacionActualizada,
            paciente: pacienteFormateado
        });

    } catch (error) {
        console.warn(`Error al actualizar la información del paciente: ${error.message}`);
        return res.status(500).json({ message: errorMessages.errorServidor });
    }
}

module.exports = { registrarPaciente, getPaciente, actualizarPaciente };
