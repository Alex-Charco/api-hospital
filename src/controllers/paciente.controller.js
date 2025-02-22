const { Paciente, Usuario } = require('../models'); // Ajusta la ruta si es necesario

// Función para registrar un paciente
const registrarPaciente = async (req, res) => {
    const { id_usuario, identificacion, fecha_nacimiento, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, genero, celular, telefono, correo, estado_civil, grupo_sanguineo, instruccion, ocupacion, empresa, discapacidad, orientacion, identidad, tipo_paciente, estatus } = req.body;

    try {
        // Verificar si el usuario logueado tiene el rol de ADMINISTRADOR
        const usuarioLogueado = req.usuario; 
        if (!usuarioLogueado || usuarioLogueado.rol.nombre_rol !== 'ADMINISTRADOR') {
            return res.status(403).json({ message: "No tienes permisos para registrar pacientes." });
        }

        // Verificar si el usuario ingresado existe
        const usuarioExistente = await Usuario.findByPk(id_usuario);
        if (!usuarioExistente) {
            return res.status(400).json({ message: "El usuario ingresado no existe." });
        }

        // Verificar si el usuario ingresado ya está asignado a otro paciente
        const pacienteExistente = await Paciente.findOne({ where: { id_usuario } });
        if (pacienteExistente) {
            return res.status(400).json({ message: "Este usuario ya está registrado como paciente." });
        }

        // Verificar si la identificación ya está registrada
        const identificacionExistente = await Paciente.findOne({ where: { identificacion } });
        if (identificacionExistente) {
            return res.status(400).json({ message: "Ya existe un paciente con esta identificación." });
        }

        // Crear el nuevo paciente
        const nuevoPaciente = await Paciente.create({
            id_usuario, // Se usa el ID del usuario ingresado, no el del administrador
            identificacion,
            fecha_nacimiento,
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            genero,
            celular,
            telefono,
            correo,
            estado_civil,
            grupo_sanguineo,
            instruccion,
            ocupacion,
            empresa,
            discapacidad,
            orientacion,
            identidad,
            tipo_paciente,
            estatus
        });

         // Formatear la fecha antes de devolver la respuesta
         const pacienteFormateado = {
            ...nuevoPaciente.toJSON(),
            fecha_nacimiento: new Date(nuevoPaciente.fecha_nacimiento).toISOString().split('T')[0] // Formato YYYY-MM-DD
        };

        // Devolver todos los datos registrados del paciente
        return res.status(201).json({
            message: "Paciente registrado exitosamente",
            paciente: pacienteFormateado
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

module.exports = { registrarPaciente };

