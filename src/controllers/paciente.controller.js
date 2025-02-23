const { Paciente, Usuario, RolUsuario } = require("../models"); // Ajusta la ruta si es necesario

    // Función para registrar un paciente
    async function registrarPaciente(req, res) {
        const {
            nombre_usuario,
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
            estatus,
        } = req.body;

        try {
            // Verificar si el usuario logueado tiene el rol de ADMINISTRADOR
            const usuarioLogueado = req.usuario;
            if (
                !usuarioLogueado ||
                usuarioLogueado.rol.nombre_rol !== "ADMINISTRADOR"
            ) {
                return res
                    .status(403)
                    .json({ message: "No tienes permisos para registrar pacientes." });
            }

            // Buscar el usuario por su nombre de usuario
            const usuarioExistente = await Usuario.findOne({
                where: { nombre_usuario },
                include: [
                    {
                        model: RolUsuario,
                        as: "rol",
                    },
                ],
            });

            if (!usuarioExistente) {
                return res
                    .status(400)
                    .json({ message: "El usuario ingresado no existe." });
            }

            // Verificar si el usuario tiene el rol PACIENTE (id_rol = 1)
            if (usuarioExistente.id_rol !== 1) {
                return res
                    .status(400)
                    .json({ message: "El usuario no tiene el rol de PACIENTE." });
            }

            // Verificar si el usuario ya está asignado a otro paciente
            const pacienteExistente = await Paciente.findOne({
                where: { id_usuario: usuarioExistente.id_usuario },
            });
            if (pacienteExistente) {
                return res
                    .status(400)
                    .json({ message: "Este usuario ya está registrado como paciente." });
            }

            // Verificar si la identificación ya está registrada
            const identificacionExistente = await Paciente.findOne({
                where: { identificacion },
            });
            if (identificacionExistente) {
                return res
                    .status(400)
                    .json({ message: "Ya existe un paciente con esta identificación." });
            }

            // Crear el nuevo paciente
            const nuevoPaciente = await Paciente.create({
                id_usuario: usuarioExistente.id_usuario, // Se obtiene el ID del usuario encontrado
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
                estatus,
            });

            // Formatear la fecha antes de devolver la respuesta
            const pacienteFormateado = {
                ...nuevoPaciente.toJSON(),
                fecha_nacimiento: new Date(nuevoPaciente.fecha_nacimiento)
                    .toISOString()
                    .split("T")[0], // Formato YYYY-MM-DD
            };

            // Devolver todos los datos registrados del paciente
            return res.status(201).json({
                message: "Paciente registrado exitosamente",
                paciente: pacienteFormateado,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error en el servidor" });
        }
    }

    // Función para obtener un paciente por identificación
    async function getPaciente(req, res) {
        const { identificacion } = req.params;

        try {
            // Verificar si el usuario logueado tiene el rol de ADMINISTRADOR o MÉDICO
            const usuarioLogueado = req.usuario;
            if (
                !usuarioLogueado ||
                !["ADMINISTRADOR", "MEDICO"].includes(usuarioLogueado.rol.nombre_rol)
            ) {
                return res
                    .status(403)
                    .json({ message: "No tienes permisos para consultar pacientes." });
            }

            // Buscar al paciente por identificación
            const paciente = await Paciente.findOne({
                where: { identificacion },
                include: [
                    {
                        model: Usuario,
                        as: "usuario",
                    },
                ],
            });

            if (!paciente) {
                return res.status(404).json({ message: "Paciente no encontrado." });
            }

            // Formatear la fecha de nacimiento antes de devolverla
            const pacienteFormateado = {
                ...paciente.toJSON(),
                fecha_nacimiento: new Date(paciente.fecha_nacimiento)
                    .toISOString()
                    .split("T")[0], // Formato YYYY-MM-DD
            };

            // Devolver los datos del paciente
            return res.status(200).json({
                message: "Paciente encontrado",
                paciente: pacienteFormateado,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error en el servidor." });
        }
    }

    // Función para actualizar la información del paciente
    async function actualizarPaciente(req, res) {
        const { identificacion } = req.params; // Identificación del paciente a actualizar
        const { fecha_nacimiento, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, genero, celular, telefono, correo, estado_civil, grupo_sanguineo, instruccion, ocupacion, empresa, discapacidad, orientacion, identidad, tipo_paciente, estatus } = req.body;

        try {
            // Verificar si el usuario logueado tiene el rol de ADMINISTRADOR
            const usuarioLogueado = req.usuario;
            if (!usuarioLogueado || usuarioLogueado.rol.nombre_rol !== 'ADMINISTRADOR') {
                return res.status(403).json({ message: "No tienes permisos para actualizar la información del paciente." });
            }

            // Buscar al paciente por su identificación
            const paciente = await Paciente.findOne({ where: { identificacion } });
            if (!paciente) {
                return res.status(404).json({ message: "Paciente no encontrado." });
            }

            // Actualizar los datos del paciente
            const pacienteActualizado = await paciente.update({
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

            // Formatear la fecha de nacimiento antes de devolverla
            const pacienteFormateado = {
                ...pacienteActualizado.toJSON(),
                fecha_nacimiento: new Date(pacienteActualizado.fecha_nacimiento).toISOString().split('T')[0] // Formato YYYY-MM-DD
            };

            // Devolver los datos actualizados del paciente
            return res.status(200).json({
                message: "Información del paciente actualizada exitosamente",
                paciente: pacienteFormateado
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error en el servidor al actualizar la información del paciente." });
        }
    }
    module.exports = {registrarPaciente, getPaciente, actualizarPaciente };
