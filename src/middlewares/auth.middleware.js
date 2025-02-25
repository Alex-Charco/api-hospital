const jwt = require("jsonwebtoken");
const RolUsuario = require("../models/rolUsuarioModel");

// Middleware para verificar el JWT y añadir los datos del usuario a la request
const verificarToken = async (req, res, next) => {
    try {
        // Obtener el token del header y eliminar el prefijo "Bearer "
        const token = req.header("Authorization")?.replace("Bearer ", "").trim();

        if (!token) {
            return res.status(401).json({ message: "No autorizado. Token no proporcionado." });
        }

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Validar que el token contenga el rol
        if (!decoded.rol || !decoded.rol.id_rol) {
            return res.status(403).json({ message: "Rol no definido en el token." });
        }

        // Buscar el rol en la base de datos y verificar si está activo
        const roleData = await RolUsuario.findOne({
            where: { id_rol: decoded.rol.id_rol, estatus: 1 },
        });

        if (!roleData) {
            return res.status(403).json({ message: "Rol no válido o desactivado." });
        }

        // Agregar datos del usuario a la request
        req.usuario = {
            id_usuario: decoded.id_usuario,
            nombre_usuario: decoded.nombre_usuario,
            rol: { ...decoded.rol, permiso: roleData.permiso },
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            console.warn(`⚠️ Token expirado el: ${error.expiredAt}`);
            return res.status(401).json({
                message: "El token ha expirado. Por favor, inicia sesión nuevamente.",
                tokenExpired: true,
            });
        }
        console.error("❌ Error en la verificación del token:", error.message);
        return res.status(401).json({ message: "Token inválido." });
    }
};

// Middleware para autorizar roles específicos
const authorizeRole = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            const { rol } = req.usuario;

            let permisos = typeof rol.permiso === "object" ? rol.permiso : JSON.parse(rol.permiso);

            if (!requiredPermissions.every(perm => permisos[perm])) {
                return res.status(403).json({ message: "No tienes permisos para realizar esta acción" });
            }

            next();
        } catch (error) {
            console.error("Error al procesar permisos:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    };
};

// Middleware para autorizar acceso a usuarios específicos
const authorizeUserAccess = (req, res, next) => {
    if (req.usuario.nombre_usuario !== req.params.nombre_usuario) {
        return res.status(403).json({ message: "No tienes permiso para acceder a este usuario" });
    }
    next();
};

module.exports = { verificarToken, authorizeRole, authorizeUserAccess };
