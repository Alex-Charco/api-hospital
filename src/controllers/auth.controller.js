const { Usuario } = require('../models');
const {buscarUsuario, verificarUsuarioExistente, verificarPassword, verificarAsignaciones, cifrarPassword, obtenerDatosUsuario } = require('../services/user.service');
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

// Función de login para iniciar sesión
/*async function login(req, res) {
    try {
        const { nombre_usuario, password } = req.body;
        const usuario = await buscarUsuario(nombre_usuario, true);

        if (!usuario?.password || !(await verificarPassword(password, usuario.password))) {
            return res.status(401).json({ message: errorMessages.credencialesInvalidas });
        }        

        // Verificar si el usuario está activo
        if (usuario.estatus !== 1) return res.status(403).json({ message: errorMessages.usuarioInactivo });


        // Verificar si el usuario tiene un rol asociado
        if (!usuario.rol) return res.status(500).json({ message: errorMessages.rolNoAsignado });


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
            message: successMessages.inicioSesionExitoso,
            token: generarToken(payload),
            user: {
                id_usuario: usuario.id_usuario,
                nombre_usuario: usuario.nombre_usuario,
                fecha_creacion: formatFechaCompleta(usuario.fecha_creacion),
                rol: {
                    id_rol: usuario.rol.id_rol,
                    nombre_rol: usuario.rol.nombre_rol,
                    permiso: permisos,
                    estatus: usuario.rol.estatus
                }
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: errorMessages.errorServidor });
    }
}
*/

async function login(req, res) {
    try {
        const { nombre_usuario, password } = req.body;
        const usuario = await buscarUsuario(nombre_usuario, true);

        if (!usuario?.password || !(await verificarPassword(password, usuario.password))) {
            return res.status(401).json({ message: errorMessages.credencialesInvalidas });
        }        

        // Verificar si el usuario está activo
        if (usuario.estatus !== 1) return res.status(403).json({ message: errorMessages.usuarioInactivo });

        // Verificar si el usuario tiene un rol asociado
        if (!usuario.rol) return res.status(500).json({ message: errorMessages.rolNoAsignado });

        // Buscar datos adicionales según el tipo de usuario (Paciente, Médico, Administrador)
        const datosUsuario = await obtenerDatosUsuario(usuario.id_usuario);

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
            message: successMessages.inicioSesionExitoso,
            token: generarToken(payload),
            user: {
                id_usuario: usuario.id_usuario,
                nombre_usuario: usuario.nombre_usuario,
                fecha_creacion: formatFechaCompleta(usuario.fecha_creacion),
                rol: {
                    id_rol: usuario.rol.id_rol,
                    nombre_rol: usuario.rol.nombre_rol,
                    permiso: permisos,
                    estatus: usuario.rol.estatus
                },
                // Agregar los datos de nombres y apellidos si existen
                primer_nombre: datosUsuario?.primer_nombre || null,
                segundo_nombre: datosUsuario?.segundo_nombre || null,
                primer_apellido: datosUsuario?.primer_apellido || null,
                segundo_apellido: datosUsuario?.segundo_apellido || null
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: errorMessages.errorServidor });
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

module.exports = { getUsuario, login, registrarUsuario, putPassword, deleteUsuario };
