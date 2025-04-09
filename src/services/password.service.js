const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer');
const Usuario = require('../models/usuario.model');
const Medico = require('../models/medico.model');
const Administrador = require('../models/administrador.model');
const Paciente = require('../models/paciente.model');
const { JWT_SECRET } = require('../utils/config');
const bcrypt = require('bcryptjs');

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

    // Enviar correo con el enlace de restablecimiento
    const transporter = nodemailer.createTransport({
	  host: "smtp.tu-servidor.com", // Cambia esto por tu servidor SMTP
	  port: 465, // Usa 465 para SSL o 587 con STARTTLS
	  secure: true, // true para SSL/TLS
	  auth: {
		user: process.env.SMTP_USER, // Usa variables de entorno
		pass: process.env.SMTP_PASS,
	  },
	});
    const resetUrl = `http://localhost:3000/auth/reset-password/reset?token=${token}`;

    const mailOptions = {
      to: email,
      from: 'support@yourapp.com',
      subject: 'Restablecer contraseña',
      text: `Para restablecer tu contraseña, haz clic en el siguiente enlace: ${resetUrl}`
    };

    await transporter.sendMail(mailOptions);
  },

  async resetPassword(token, nombre_usuario, newPassword) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Buscar usuario por id_usuario y validar nombre_usuario
      const user = await Usuario.findOne({ where: { id_usuario: decoded.id_usuario, nombre_usuario } });

      if (!user) throw new Error('El nombre de usuario no coincide con el usuario asociado al restablecimiento.');

      user.password = await hashPassword(newPassword);
      await user.save();
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    console.error('Error al verificar el token de restablecimiento de contraseña:', error);
    throw new Error('El token es inválido o ha expirado.');
  }
  
  }
};
