const passwordService = require('../services/password.service');

module.exports = {
  async requestPasswordReset(req, res) {
    const { email } = req.body;
    try {
      await passwordService.sendPasswordResetEmail(email);
      res.status(200).json({ message: 'Si el correo es correcto, recibirás un enlace para restablecer tu contraseña.' });
    } catch (error) {
      res.status(500).json({ error: error.message || 'Error al procesar la solicitud de restablecimiento de contraseña.' });
    }
  },

  async resetPassword(req, res) {
    const { token, nombre_usuario, newPassword } = req.body;
    try {
        await passwordService.resetPassword(token, nombre_usuario, newPassword);
        res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
    } catch (error) {
        console.error("Error al restablecer la contraseña:", error);
        res.status(500).json({ error: error.message || 'Error al restablecer la contraseña.' });
    }
  }
};
