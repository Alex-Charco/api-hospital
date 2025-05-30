const familiarService = require('../services/familiar.service');
const infoMilitarService = require('../services/info_militar.service');
const { formatFecha } = require('../utils/date_utils');
const errorMessages = require('../utils/error_messages');
const successMessages = require('../utils/success_messages');

// Crear nuevo registro de familiar (solo administradores)
async function registrarFamiliar(req, res) {
    const { identificacionPaciente } = req.params;
    const { relacion, direccion, nombre, apellido, telefono, ...otrosDatos } = req.body;

    try {
        // Validar que el paciente existe
        const paciente = await infoMilitarService.validarPacienteExistente(identificacionPaciente);
        
        // Validar que no haya un familiar ya registrado (si corresponde)
        await familiarService.validarFamiliarRegistrado(paciente.id_paciente, relacion);

        // Crear nuevo familiar, pasando otros datos dinámicamente
        const familiar = await familiarService.crearFamiliar(paciente.id_paciente, {
            nombre, apellido, telefono, direccion, relacion, ...otrosDatos
        });

        // Formatear la fecha antes de devolver la respuesta
        const familiarFormateado = {
            ...familiar.toJSON(),
            fecha_nacimiento: formatFecha(familiar.fecha_nacimiento)
        };

        return res.status(201).json({
            message: successMessages.registroExitoso,
            familiar: familiarFormateado
        });
    } catch (error) {
        console.error("❌ Error en registrarFamiliar:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// Obtener información de un familiar por paciente (solo administradores y médicos)
async function getByFamiliar(req, res) {
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

        // Si encontramos el paciente, obtenemos todos los familiares
        if (paciente) {
            const familiares = await familiarService.obtenerFamiliarCondicional({ id_paciente: paciente.id_paciente });
            return res.status(200).json(familiares);
        }

        // Si no se encuentra como paciente, buscamos por identificación del familiar
        console.log("Buscando familiar por identificación:", identificacion); // Agregado para depuración
        const familiar = await familiarService.obtenerFamiliarPorIdentificacion(identificacion);

        if (!familiar) {
            return res.status(404).json({ message: errorMessages.noInfoIdentificacion });
        }

        return res.status(200).json(familiar);
    } catch (error) {
        console.error("❌ Error en getByFamiliar:", error.message);
        return res.status(500).json({ message: error.message ||  errorMessages.errorServidor });
    }
}

// ✅ Actualizar información del familiar (solo administradores)
async function actualizarFamiliar(req, res) {
    const { identificacionPaciente } = req.params;
    const { id_usuario_modificador, ...nuevosDatos } = req.body;

    try {
        // Validar si el paciente existe
        const paciente = await infoMilitarService.validarPacienteExistente(identificacionPaciente);

        if (!paciente) {
            return res.status(404).json({ message: errorMessages.pacienteNoEncontrado });
        }

        // Buscar el familiar asociado al paciente
        const familiar = await familiarService.obtenerFamiliarCondicional({ id_paciente: paciente.id_paciente });

        // Actualizar la información del familiar con historial
        const familiarActualizado = await familiarService.actualizarDatosFamiliar(familiar, nuevosDatos, id_usuario_modificador);

        const familiarFormateado = {
            ...familiarActualizado.toJSON(),
            fecha_nacimiento: formatFecha(familiarActualizado.fecha_nacimiento)
        };

        return res.status(200).json({
            message: successMessages.informacionActualizada,
            familiar: familiarFormateado
        });
    } catch (error) {
        console.error("❌ Error en actualizarFamiliar:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = { registrarFamiliar, getByFamiliar, actualizarFamiliar };
