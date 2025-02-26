const jwt = require("jsonwebtoken");
const RolUsuario = require("../models/rolUsuarioModel");
const errorMessages = require("../utils/errorMessages");
const { buscarUsuario } = require("../services/user.service");

// Middleware para verificar el JWT y añadir los datos del usuario a la request
const verificarToken = async (req, res, next) => {
    try {
        // Obtener el token del header y eliminar el prefijo "Bearer "
        const token = req.header("Authorization")?.replace("Bearer ", "").trim();

        if (!token) {
            return res.status(401).json({ message: errorMessages.tokenNoProporcionado });
        }

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Validar que el token contenga el rol
        if (!decoded.rol?.id_rol) {
            return res.status(403).json({ message: errorMessages.rolNoDefinido });
        }

        // Buscar el rol en la base de datos y verificar si está activo
        const roleData = await RolUsuario.findOne({
            where: { id_rol: decoded.rol.id_rol, estatus: 1 },
        });

        if (!roleData) {
            return res.status(403).json({ message: errorMessages.rolNoValido });
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
                message: errorMessages.tokenExpirado,
                tokenExpired: true,
            });
        }
        console.error("❌ Error en la verificación del token:", error.message);
        return res.status(401).json({ message: errorMessages.tokenInvalido });
    }
};

// Middleware para autorizar roles específicos
const authorizeRole = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            const { rol } = req.usuario;

            let permisos = typeof rol.permiso === "object" ? rol.permiso : JSON.parse(rol.permiso);

            // Verifica si el usuario tiene al menos uno de los permisos requeridos
            if (!requiredPermissions.some(perm => permisos[perm])) {
                return res.status(403).json({ message: errorMessages.permisosInsuficientes });
            }

            next();
        } catch (error) {
            console.error("Error al procesar permisos:", error);
            return res.status(500).json({ message: errorMessages.errorServidor });
        }
    };
};

// Middleware para autorizar acceso a usuarios específicos
const authorizeUserAccess = (req, res, next) => {
    if (req.usuario.nombre_usuario !== req.params.nombre_usuario) {
        return res.status(403).json({ message: errorMessages.accesoNoPermitido });
    }
    next();
};

const verificarAdminEliminar = async (req, res, next) => {
    try {
        // Buscar el usuario que se quiere eliminar
        const usuarioAEliminar = await buscarUsuario(req.params.nombre_usuario);
        if (!usuarioAEliminar) {
            return res.status(404).json({ message: errorMessages.usuarioNoEncontrado });
        }

        // Verificar si el usuario autenticado es ADMINISTRADOR y está intentando eliminar otro ADMINISTRADOR
        if (
            req.usuario.rol.nombre_rol === "ADMINISTRADOR" &&
            usuarioAEliminar.rol?.nombre_rol === "ADMINISTRADOR"
        ) {
            return res.status(403).json({ message: errorMessages.noEliminarAdmin });
        }

        next(); // Continuar con la eliminación si pasa la validación
    } catch (error) {
        console.error("Error en verificarAdminEliminar:", error);
        return res.status(500).json({ message: errorMessages.errorServidor });
    }
};


module.exports = { verificarToken, authorizeRole, authorizeUserAccess, verificarAdminEliminar };
