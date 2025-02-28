const residenciaService = require('../services/residencia.service');
const infoMilitarService = require('../services/info_militar.service');
const { formatFecha } = require('../utils/date_utils');
const errorMessages = require('../utils/error_messages');
const successMessages = require('../utils/success_messages');

// Crear nueva residencia (solo administradores)
async function registrarResidencia(req, res) {
    const { identificacion } = req.params;
    const { direccion, ciudad, pais, ...otrosDatos } = req.body;

    try {
        // Validar que el paciente existe
        const paciente = await infoMilitarService.validarPacienteExistente(identificacion);

        // Verificar si el paciente no fue encontrado
        if (!paciente) {
            return res.status(404).json({ message: errorMessages.errorValidarPaciente });
        }

        // Validar que no haya una residencia ya registrada para el paciente
        await residenciaService.validarResidenciaRegistrada(paciente.id_paciente);

        // Crear nueva residencia, pasando otros datos dinámicamente
        const residencia = await residenciaService.crearResidencia(paciente.id_paciente, {
            direccion, ciudad, pais, ...otrosDatos
        });

        // Usar la función formatFecha para formatear la fecha de creación
        const residenciaFormateado = {
            ...residencia.toJSON(),
            fecha_registro: formatFecha(residencia.fecha_registro)
        };

        return res.status(201).json({
            message: successMessages.registroExitoso,
            residencia: residenciaFormateado
        });
    } catch (error) {
        console.error("❌ Error en registrarResidencia:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// Obtener residencia por paciente (solo administradores y médicos)
async function getByResidencia(req, res) {
    try {
        const { identificacion } = req.params;

        if (!identificacion) {
            return res.status(400).json({ message: errorMessages.identificacionRequerida });
        }

        // Buscar al paciente por la identificación
        const paciente = await infoMilitarService.validarPacienteExistente(identificacion);

        // Verificar si el paciente no fue encontrado
        if (!paciente) {
            return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });
        }

        // Si encontramos el paciente, obtenemos la residencia
        const residencia = await residenciaService.obtenerResidencia(paciente.id_paciente);

        // Verificar si hay residencia registrada
        if (!residencia) {
            return res.status(404).json({ message: errorMessages.residenciaNoEncontrada });
        }

        // Usar la función formatFecha para formatear la fecha de creación
        const fechaFormateada = formatFecha(residencia.fecha_registro);

        return res.status(200).json({
            id_residencia: residencia.id_residencia,
            id_paciente: residencia.id_paciente,
            lugar_nacimiento: residencia.lugar_nacimiento,
            pais: residencia.pais,
            nacionalidad: residencia.nacionalidad,
            provincia: residencia.provincia,
            canton: residencia.canton,
            parroquia: residencia.parroquia,
            direccion: residencia.direccion,
            fecha_registro: fechaFormateada
        });
    } catch (error) {
        console.error("❌ Error en getByResidencia:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// Actualizar residencia (solo administradores)
async function actualizarResidencia(req, res) {
    const { identificacion } = req.params;
    const nuevosDatos = req.body;

    try {
        // Buscar paciente por identificación
        const paciente = await infoMilitarService.validarPacienteExistente(identificacion);

        // Obtener la residencia asociada al paciente
        const residencia = await residenciaService.obtenerResidencia(paciente.id_paciente);

        // Actualizar la información de la residencia
        const residenciaActualizada = await residenciaService.actualizarResidencia(residencia, nuevosDatos);

        const residenciaFormateado = {
            ...residenciaActualizada.toJSON(),
            fecha_registro: formatFecha(residenciaActualizada.fecha_registro)
        };

        return res.status(200).json({
            message: successMessages.informacionActualizada,
            residencia: residenciaFormateado
        });
    } catch (error) {
        console.error("❌ Error en actualizarResidencia:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = { registrarResidencia, getByResidencia, actualizarResidencia };
