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

module.exports = {
    buscarUsuario,
    verificarUsuarioExistente,
    verificarPassword,
    verificarAsignaciones,
    cifrarPassword
};
