const familiarService = require('../services/familiar.service');
const infoMilitarService = require('../services/infoMilitar.service');
const { formatFechaNacimiento } = require('../utils/dateUtils');
const errorMessages = require('../utils/errorMessages');
const successMessages = require('../utils/successMessages');

// Crear nuevo registro de familiar (solo administradores)
async function registrarFamiliar(req, res) {
    const { identificacion } = req.params;
    const { relacion, direccion, nombre, apellido, telefono, ...otrosDatos } = req.body;

    try {
        // Validar que el paciente existe
        const paciente = await infoMilitarService.validarPacienteExistente(identificacion);
        
        // Validar que no haya un familiar ya registrado (si corresponde)
        await familiarService.validarFamiliarRegistrado(paciente.id_paciente, relacion);

        // Crear nuevo familiar, pasando otros datos dinámicamente
        const familiar = await familiarService.crearFamiliar(paciente.id_paciente, {
            nombre, apellido, telefono, direccion, relacion, ...otrosDatos
        });

        // Formatear la fecha antes de devolver la respuesta
        const familiarFormateado = {
            ...familiar.toJSON(),
            fecha_nacimiento: formatFechaNacimiento(familiar.fecha_nacimiento)
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
            return res.status(400).json({ message: "La identificación es requerida." });
        }

        // Buscar al paciente por la identificación
        const paciente = await infoMilitarService.validarPacienteExistente(identificacion);

        // Si encontramos el paciente, obtenemos todos los familiares
        if (paciente) {
            const familiares = await familiarService.obtenerFamiliarCondicional({ id_paciente: paciente.id_paciente });
            return res.status(200).json(familiares);
        }

        // Si no se encuentra como paciente, buscamos por identificación del familiar
        console.log("Buscando familiar por identificación:", identificacion); // Agregado para depuración
        const familiar = await familiarService.obtenerFamiliarPorIdentificacion(identificacion);

        if (!familiar) {
            return res.status(404).json({ message: "No se encontró información para la identificación proporcionada." });
        }

        return res.status(200).json(familiar);
    } catch (error) {
        console.error("❌ Error en getByFamiliar:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor, error: error.stack  });
    }
}

// Actualizar información de un familiar (solo administradores)
async function actualizarFamiliar(req, res) {
    const { identificacionPaciente, identificacionFamiliar } = req.params;
    const nuevosDatos = req.body;

    try {
        // Buscar paciente por identificación
        const paciente = await infoMilitarService.validarPacienteExistente(identificacionPaciente);
        
        // Buscar familiar por identificación y por el id_paciente
        const familiar = await familiarService.obtenerFamiliarPorIdentificacion(identificacionFamiliar, paciente.id_paciente);

        // Actualizar la información del familiar
        const familiarActualizado = await familiarService.actualizarFamiliar(familiar, nuevosDatos);

        const familiarFormateado = {
            ...familiarActualizado.toJSON(),
            fecha_nacimiento: formatFechaNacimiento(familiarActualizado.fecha_nacimiento)
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
