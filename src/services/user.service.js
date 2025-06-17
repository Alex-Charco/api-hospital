const { Usuario, RolUsuario, Paciente, Medico, Administrador } = require('../models');
const bcrypt = require('bcryptjs');

async function buscarUsuario(nombre_usuario) {
    return await Usuario.findOne({
        where: { nombre_usuario },
        include: [{
            model: RolUsuario,
            as: 'rol',
            attributes: ['id_rol', 'nombre_rol', 'permiso', 'estatus']
        }]
    });
}

// Función para verificar si el usuario ya existe
async function verificarUsuarioExistente(nombre_usuario) {
    return await Usuario.findOne({ where: { nombre_usuario } });
}

// Función para verificar si la contraseña es correcta
async function verificarPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Función para verificar asignaciones a roles (Paciente, Medico, Administrador)
async function verificarAsignaciones(id_usuario) {
    const paciente = await Paciente.findOne({ where: { id_usuario } });
    const medico = await Medico.findOne({ where: { id_usuario } });
    const administrador = await Administrador.findOne({ where: { id_usuario } });

    return !!(paciente || medico || administrador);
}

async function cifrarPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function obtenerDatosUsuario(id_usuario) {
    try {
        let datosUsuario = await Paciente.findOne({ 
            where: { id_usuario }, 
            attributes: ['id_paciente','primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'identificacion', 'estatus'],
            raw: true
        });
        if (datosUsuario) return { ...datosUsuario, tipo: 'paciente' };
        datosUsuario = await Medico.findOne({ 
            where: { id_usuario }, 
            attributes: ['id_medico','primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'identificacion', 'estatus'],
            raw: true
        });
        if (datosUsuario) return { ...datosUsuario, tipo: 'medico' };
        datosUsuario = await Administrador.findOne({ 
            where: { id_usuario }, 
            attributes: ['id_admin','primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'identificacion', 'estatus'],
            raw: true
        });
        return datosUsuario ? { ...datosUsuario, tipo: 'administrador' } : null;
    } catch (error) {
        console.error(`Error al obtener datos del usuario: ${error.message}`);
        return null;
    }
}

async function actualizarEstatusUsuario(nombre_usuario, nuevoEstatus) {
    const usuario = await buscarUsuario(nombre_usuario);
    if (!usuario) return null;

    usuario.estatus = nuevoEstatus;
    await usuario.save();
    return usuario;
}

module.exports = {
    buscarUsuario,
    verificarUsuarioExistente,
    verificarPassword,
    verificarAsignaciones,
    cifrarPassword,
	obtenerDatosUsuario,
	actualizarEstatusUsuario
};
