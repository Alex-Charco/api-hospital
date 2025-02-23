const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario, RolUsuario } = require('../models');

// Función para buscar un usuario por nombre (solo para ADMINISTRADOR)
async function getUsuario(req, res) {
    const { nombre_usuario } = req.params;

    try {
        const usuarioLogueado = req.usuario;
        if (!usuarioLogueado || usuarioLogueado.rol.nombre_rol !== 'ADMINISTRADOR') {
            return res.status(403).json({ message: "No tienes permisos para realizar esta acción" });
        }

        const usuario = await Usuario.findOne({
            where: { nombre_usuario },
            include: [{
                model: RolUsuario,
                as: 'rol',
                attributes: ['id_rol', 'nombre_rol', 'permiso', 'estatus']
            }]
        });

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.json({
            message: "Usuario encontrado exitosamente",
            id_usuario: usuario.id_usuario,
            nombre_usuario: usuario.nombre_usuario,
            fecha_creacion: usuario.fecha_creacion,
            rol: usuario.rol
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
}

// Función para registrar un nuevo usuario
async function registrarUsuario(req, res) {
    const { nombre_usuario, password, id_rol } = req.body;

    try {
        // Verificar si el usuario actual tiene el rol de Administrador
        const usuarioLogueado = req.usuario; 
        if (!usuarioLogueado || usuarioLogueado.rol.nombre_rol !== 'ADMINISTRADOR') {
            return res.status(403).json({ message: "No tienes permisos para realizar esta acción" });
        }

        // Verificar si el nombre de usuario ya existe
        const usuarioExistente = await Usuario.findOne({
            where: { nombre_usuario }
        });

        if (usuarioExistente) {
            return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
        }

        // Cifrar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario
        const nuevoUsuario = await Usuario.create({
            nombre_usuario,
            password: hashedPassword,
            id_rol, 
            fecha_creacion: new Date(),  
            estatus: 1 
        });
        // Formatear la fecha de creación para un formato más legible
        const fechaFormateada = new Date(nuevoUsuario.fecha_creacion).toISOString().slice(0, 19).replace('T', ' ');

        return res.status(201).json({
            message: "Usuario registrado exitosamente",
            usuario: {
                id_usuario: nuevoUsuario.id_usuario,
                nombre_usuario: nuevoUsuario.nombre_usuario,
                fecha_creacion: fechaFormateada,
                id_rol: nuevoUsuario.id_rol
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
}

// Función de login para iniciar sesión
async function login(req, res) {
    const { nombre_usuario, password } = req.body;

    try {
        const user = await Usuario.findOne({
            where: { nombre_usuario },
            include: [{
                model: RolUsuario,
                as: 'rol', 
                attributes: ['id_rol', 'nombre_rol', 'permiso', 'estatus']
            }]
        });

        if (!user) {
            console.log("❌ Usuario no encontrado:", nombre_usuario);
            return res.status(401).json({ message: "Usuario no encontrado" });
        }

        // Verificar si el usuario tiene una contraseña
        if (!user.password) {
            console.error("❌ Error: El usuario no tiene contraseña en la BD.");
            return res.status(401).json({ message: "Contraseña no disponible en la base de datos" });
        }

        console.log("🔐 Contraseña ingresada:", password);
        console.log("🔐 Contraseña en BD:", user.password);

        // Verificar la contraseña usando bcryptjs
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // Verificar si el usuario está activo
        if (user.estatus !== 1) {
            console.error("❌ Error: El usuario inactivo.");
            return res.status(403).json({ message: "User is inactive" });
        }

        // Verificar si el usuario tiene un rol asociado
        if (!user.rol) {
            console.error("❌ Error: El usuario no tiene un rol asignado.");
            return res.status(500).json({ message: "Error: El usuario no tiene un rol asignado" });
        }

        // Formatear la fecha de creación para un formato más legible
        const fechaFormateada = new Date(user.fecha_creacion).toISOString().slice(0, 19).replace('T', ' ');

        const permisos = user.rol.permiso;

        const payload = {
            id_usuario: user.id_usuario,
            nombre_usuario: user.nombre_usuario,
            rol: {
                id_rol: user.rol.id_rol,
                nombre_rol: user.rol.nombre_rol,
                permiso: permisos
            }
        };

        // Generar token con expiración de 1 hora
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.json({
            message: "Inicio de sesión exitoso",
            token: token,
            user: {
                id_usuario: user.id_usuario,
                nombre_usuario: user.nombre_usuario,
                fecha_creacion: fechaFormateada,
                rol: {
                    id_rol: user.rol.id_rol,
                    nombre_rol: user.rol.nombre_rol,
                    permiso: permisos,
                    estatus: user.rol.estatus
                }
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
}

// Función para actualizar la contraseña de un usuario (solo ADMINISTRADOR)
async function updatePassword(req, res) {
    const { nombre_usuario } = req.params; 
    const { nueva_password } = req.body; 

    try {
        // Verificar si el usuario actual tiene el rol de ADMINISTRADOR
        const usuarioLogueado = req.usuario;
        if (!usuarioLogueado || usuarioLogueado.rol.nombre_rol !== 'ADMINISTRADOR') {
            return res.status(403).json({ message: "No tienes permisos para realizar esta acción" });
        }

        // Buscar el usuario por nombre
        const usuario = await Usuario.findOne({ where: { nombre_usuario } });

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Cifrar la nueva contraseña
        const hashedPassword = await bcrypt.hash(nueva_password, 10);

        // Actualizar la contraseña
        await usuario.update({ password: hashedPassword });

        return res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
}

module.exports = { getUsuario, login, registrarUsuario, updatePassword };
