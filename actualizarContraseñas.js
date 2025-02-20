const bcrypt = require('bcryptjs');
const { Usuario } = require('./models');

async function actualizarContraseñas() {
    try {
        // Obtener todos los usuarios
        const usuarios = await Usuario.findAll();

        for (let user of usuarios) {
            // Cifrar la contraseña
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Actualizar la contraseña en la base de datos
            await user.update({ password: hashedPassword });
            console.log(`Contraseña para ${user.nombre_usuario} actualizada correctamente`);
        }

        console.log('Actualización de contraseñas completada');
    } catch (error) {
        console.error('Error al actualizar las contraseñas:', error);
    }
}

// Ejecutar la función
actualizarContraseñas();
