const jwt = require("jsonwebtoken");
const RolUsuario = require("../models/rolUsuarioModel");
const Usuario = require("../models/usuarioModel");

// Middleware para autenticar el token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado: token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token no válido' });
        }
        req.user = user; 
        next();
    });
};

// Middleware para autorizar roles específicos
const authorizeRole = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            const { rol } = req.user;

            if (!rol) {
                return res.status(400).json({ message: "El rol es requerido" });
            }

            const roleData = await RolUsuario.findOne({
                where: { id_rol: rol.id_rol, estatus: 1 },
            });

            if (!roleData) {
                return res.status(403).json({ message: "Rol no válido o desactivado" });
            }

            const permissions = typeof roleData.permiso === "string" ? JSON.parse(roleData.permiso) : roleData.permiso;

            const hasPermission = requiredPermissions.every((perm) => permissions.includes(perm));

            if (!hasPermission) {
                return res.status(403).json({ message: "No tienes permisos para realizar esta acción" });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error al verificar permisos" });
        }
    };
};

// Middleware para autorizar acceso a usuarios específicos
const authorizeUserAccess = async (req, res, next) => {
    const { id_usuario } = req.user; 
    const { id_usuario: idParam } = req.params; 
    
    if (id_usuario !== Number(idParam)) {
        return res.status(403).json({ message: "No tienes permiso para acceder a este usuario" });
    }

    next();
};

module.exports = { authenticateToken, authorizeRole, authorizeUserAccess };
