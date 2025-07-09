const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const Usuario = require('../models/usuario.model');
const Medico = require('../models/medico.model');
const Administrador = require('../models/administrador.model');
const Paciente = require('../models/paciente.model');
const { JWT_SECRET } = require('../utils/config');
const bcrypt = require('bcryptjs');
require('dotenv').config();

//console.log("🔐 RESEND_API_KEY:", process.env.RESEND_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

module.exports = {
  async sendPasswordResetEmail(email) {
    let user = null;

    // Buscar en las tablas medico, paciente y administrador
    const medico = await Medico.findOne({ where: { correo: email } });
    const administrador = await Administrador.findOne({ where: { correo: email } });
    const paciente = await Paciente.findOne({ where: { correo: email } });

    if (medico) {
      user = await Usuario.findOne({ where: { id_usuario: medico.id_usuario } });
    } else if (administrador) {
      user = await Usuario.findOne({ where: { id_usuario: administrador.id_usuario } });
    } else if (paciente) {
      user = await Usuario.findOne({ where: { id_usuario: paciente.id_usuario } });
    }

    if (!user) throw new Error('No se encontró un usuario con este correo.');

    // Generar un token con id_usuario
    const token = jwt.sign({ id_usuario: user.id_usuario }, JWT_SECRET, { expiresIn: '1h' });

    const resetUrl = `http://localhost:3000/auth/reset-password/reset?token=${token}`;

    // ✅ Enviar con Resend
    try {
      const response = await resend.emails.send({
        from: 'onboarding@resend.dev', // dirección oficial de pruebas permitida por Resend
		to: 'awladimircharco@gmail.com',
        subject: 'Restablecer contraseña',
        text: `Hola, haz clic en el siguiente enlace para restablecer tu contraseña: ${resetUrl}`,
      });

      console.log("✅ Correo enviado con Resend:", response);
    } catch (error) {
      console.error("❌ Error al enviar correo con Resend:", error);
      throw new Error("Fallo al enviar el correo de restablecimiento.");
    }
  },

  async resetPassword(token, nombre_usuario, newPassword) {
    try {
      // 1. Verificar que el token JWT sea válido y decodificar su contenido
      const decoded = jwt.verify(token, JWT_SECRET);

      // 2. Buscar al usuario en la base de datos por el ID contenido en el token
      const user = await Usuario.findOne({ where: { id_usuario: decoded.id_usuario } });

      // 3. Validar que el usuario exista
      if (!user) {
        throw new Error('No se encontró el usuario asociado al token.');
      }

      // 4. Confirmar que el nombre de usuario proporcionado coincide con el del token
      if (user.nombre_usuario !== nombre_usuario) {
        throw new Error('El nombre de usuario no coincide con el usuario asociado al restablecimiento.');
      }

      // 5. Cifrar la nueva contraseña y actualizarla en la base de datos
      user.password = await hashPassword(newPassword);
      await user.save();

    } catch (error) {
      // 6. Manejar errores y mostrar un mensaje adecuado
      console.error('Error al restablecer la contraseña:', error);
	  
	  if (error.name === 'JsonWebTokenError') {
		throw new Error('Token inválido.');
	  }
  
      throw new Error('No se pudo restablecer la contraseña. ' + error.message);
    }
  }

}