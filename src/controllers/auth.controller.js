const { Usuario } = require('../models');
const {
	buscarUsuario, 
	verificarUsuarioExistente, 
	verificarPassword, 
	verificarAsignaciones, 
	cifrarPassword, 
	obtenerDatosUsuario,
	actualizarEstatusUsuario 	
	} = require('../services/user.service');
const { validarPassword } = require('../services/validation.service');
const errorMessages = require('../utils/error_messages');
const { generarToken } = require('../services/auth.service');
const { formatFechaCompleta } = require('../utils/date_utils');
const successMessages = require('../utils/success_messages');

// Función para buscar un usuario por nombre (solo para ADMINISTRADOR)
async function getUsuario(req, res) {
    try {
        const usuario = await buscarUsuario(req.params.nombre_usuario);
        if (!usuario) return res.status(404).json({ message: errorMessages.usuarioNoEncontrado });

        // Usar la función formatFechaCompleta para formatear la fecha de creación
        const fechaFormateada = formatFechaCompleta(usuario.fecha_creacion);

        return res.json({
            message: successMessages.usuarioEncontrado,
            id_usuario: usuario.id_usuario,
            nombre_usuario: usuario.nombre_usuario,
			estatus: usuario.estatus,
            fecha_creacion: fechaFormateada,
            rol: usuario.rol
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: errorMessages.errorServidor });
    }
}

// Función para registrar un nuevo usuario
async function registrarUsuario(req, res) {
    const { nombre_usuario, password, id_rol } = req.body;

    try {
        // Verificar si el nombre de usuario ya existe
        const usuarioExistente = await verificarUsuarioExistente(nombre_usuario);

        if (usuarioExistente) return res.status(400).json({ message: errorMessages.usuarioYaExiste });

        // Validar si la contraseña cumple con los requisitos de seguridad
        if (!validarPassword(password)) {
            return res.status(400).json({ 
                message: errorMessages.passwordInsegura 
            });
        }

        // Crear el nuevo usuario
        const nuevoUsuario = await Usuario.create({
            nombre_usuario,
            password: await cifrarPassword(password),
            id_rol, 
            fecha_creacion: new Date(),  
            estatus: 1 
        });
        
        // Usar la función formatFechaCompleta para formatear la fecha de creación
        const fechaFormateada = formatFechaCompleta(nuevoUsuario.fecha_creacion);

        return res.status(201).json({
            message: successMessages.registroExitoso,
            usuario: {
                id_usuario: nuevoUsuario.id_usuario,
                nombre_usuario: nuevoUsuario.nombre_usuario,
                fecha_creacion: fechaFormateada,
                id_rol: nuevoUsuario.id_rol
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: errorMessages.errorServidor });
    }
}

const loginAttempts = new Map();

async function login(req, res) {
    try {
        const { nombre_usuario, password } = req.body;
        const now = Date.now();
        const attempt = loginAttempts.get(nombre_usuario) || { count: 0, firstAttempt: now };

        // Verificar si está bloqueado
        if (attempt.blockedUntil && now < attempt.blockedUntil) {
            const waitSeconds = Math.ceil((attempt.blockedUntil - now) / 1000);
            return res.status(429).json({
                message: `Demasiados intentos fallidos. Intenta de nuevo en ${waitSeconds} segundos.`
            });
        }

        const usuario = await buscarUsuario(nombre_usuario, true);

        // Si credenciales inválidas
        if (!usuario?.password || !(await verificarPassword(password, usuario.password))) {
    if (!attempt) {
        loginAttempts.set(nombre_usuario, { count: 1, firstAttempt: now });
    } else {
        attempt.count += 1;

        if (attempt.count >= 3) {
            attempt.blockedUntil = now + 15 * 60 * 1000;
            loginAttempts.set(nombre_usuario, attempt);
            return res.status(429).json({
                message: 'Has superado el número máximo de intentos. Tu cuenta se ha bloqueado por 15 minutos.'
            });
        }

        loginAttempts.set(nombre_usuario, attempt);
    }

    return res.status(401).json({ message: 'Credenciales inválidas.' });
}

        // Login exitoso: limpiar intentos fallidos
        loginAttempts.delete(nombre_usuario);

        // Validaciones adicionales...
        if (usuario.estatus !== 1) {
            return res.status(403).json({ message: 'Usuario inactivo.' });
        }

        if (!usuario.rol) {
            return res.status(500).json({ message: 'Rol no asignado.' });
        }

        const datosUsuario = await obtenerDatosUsuario(usuario.id_usuario);
        if (datosUsuario?.estatus !== 1) {
            return res.status(403).json({ message: `La cuenta del ${datosUsuario.tipo} está inactiva.` });
        }

        const permisos = usuario.rol.permiso;

        const payload = {
            id_usuario: usuario.id_usuario,
            nombre_usuario: usuario.nombre_usuario,
            rol: {
                id_rol: usuario.rol.id_rol,
                nombre_rol: usuario.rol.nombre_rol,
                permiso: permisos
            }
        };

        return res.json({
            message: 'Inicio de sesión exitoso.',
            token: generarToken(payload),
            user: {
                id_usuario: usuario.id_usuario,
                nombre_usuario: usuario.nombre_usuario,
                fecha_creacion: formatFechaCompleta(usuario.fecha_creacion),
                rol: usuario.rol,
                ...datosUsuario
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error en el servidor.' });
    }
}

// Función para que un usuarioautenticado cambie la contraseña
async function putPassword(req, res) {
    try {
        // Buscar el usuario por nombre de usuario
        const usuario = await buscarUsuario(req.params.nombre_usuario);
        if (!usuario) return res.status(404).json({ message: errorMessages.usuarioNoEncontrado });


        // Verificar la contraseña actual
        if (!(await verificarPassword(req.body.password_actual, usuario.password))) {
            return res.status(401).json({ message: errorMessages.passwordActualIncorrecta });
        }

        // Verifica que la contraseña sea segura
        if (!validarPassword(req.body.nueva_password)) {
            return res.status(400).json({ message: errorMessages.passwordInsegura });
        }

        // Actualizar la contraseña en la base de datos
        await usuario.update({ password: await cifrarPassword(req.body.nueva_password) });

        await usuario.save();

        // Responder con un mensaje que indique que se requiere un nuevo inicio de sesión
        return res.status(200).json({ 
            message: successMessages.passwordActualizada,
            logout: true // Indica al frontend que cierre la sesión
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: errorMessages.errorServidor });
    }
}

// Actualizar solo el estatus del usuario
async function putEstatus(req, res) {
    try {
        const { nombre_usuario } = req.params;
        const { estatus } = req.body;  // Cambié "nuevo_estatus" por "estatus"

        console.log("estatus recibido:", estatus);
        console.log("typeof estatus:", typeof estatus);

        // Convertimos a número, para garantizar que es un 0 o 1
        const estatusNumerico = Number(estatus);

        console.log("estatusNumerico:", estatusNumerico);
        console.log("Es entero válido:", Number.isInteger(estatusNumerico));
        console.log("¿Es 0 o 1?", [0, 1].includes(estatusNumerico));

        // Validación estricta
        if (!Number.isInteger(estatusNumerico) || ![0, 1].includes(estatusNumerico)) {
            return res.status(400).json({ message: "El estatus debe ser 0 o 1 (inactivo o activo)." });
        }

        // Llamamos la función para actualizar el estatus del usuario en la base de datos
        const usuarioActualizado = await actualizarEstatusUsuario(nombre_usuario, estatusNumerico);
        if (!usuarioActualizado) {
            return res.status(404).json({ message: errorMessages.usuarioNoEncontrado });
        }

        return res.status(200).json({ 
            message: "Estatus actualizado correctamente.",
            usuario: {
                nombre_usuario: usuarioActualizado.nombre_usuario,
                estatus: usuarioActualizado.estatus
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: errorMessages.errorServidor });
    }
}


// Función para eliminar un usuario
async function deleteUsuario(req, res) {
    try {
        // Verificar si el usuario a eliminar existe
        const usuario = await buscarUsuario(req.params.nombre_usuario);
        if (!usuario) return res.status(404).json({ message: errorMessages.usuarioNoEncontrado });

        // Verificar si el usuario está asignado en otras tablas con su id_usuario
        const tieneAsignaciones = await verificarAsignaciones(usuario.id_usuario);
        if (tieneAsignaciones) {
            return res.status(400).json({ message: errorMessages.usuarioAsignado });
        }

        // Eliminar el usuario
        await usuario.destroy();

        return res.status(200).json({ message: successMessages.usuarioEliminado });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: errorMessages.errorServidor });
    }
}

module.exports = { getUsuario, login, registrarUsuario, putPassword, putEstatus, deleteUsuario };
