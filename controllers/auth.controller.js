const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario, RolUsuario } = require('../models');

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

module.exports = { login };
