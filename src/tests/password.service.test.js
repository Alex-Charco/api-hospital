const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mocks de paquetes externos
jest.mock('resend');
jest.mock('jsonwebtoken');

// Mocks de los modelos
jest.mock('../models/usuario.model', () => ({ findOne: jest.fn() }));
jest.mock('../models/medico.model', () => ({ findOne: jest.fn() }));
jest.mock('../models/administrador.model', () => ({ findOne: jest.fn() }));
jest.mock('../models/paciente.model', () => ({ findOne: jest.fn() }));

// Antes de requerir el servicio, preparamos el mock de Resend
const { Resend } = require('resend');
Resend.prototype.emails = {
  send: jest.fn().mockResolvedValue({
    data: { id: 'fake-id' },
    error: null
  })
};

// Ahora sí importamos el servicio (ya tiene el mock activo)
const passwordService = require('../services/password.service');

const Usuario = require('../models/usuario.model');
const Medico = require('../models/medico.model');
const Administrador = require('../models/administrador.model');
const Paciente = require('../models/paciente.model');

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Servicios de contraseña', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendPasswordResetEmail()', () => {
    test('debería enviar un correo si el usuario existe como médico', async () => {
      Medico.findOne.mockResolvedValue({ id_usuario: 1 });
      Administrador.findOne.mockResolvedValue(null);
      Paciente.findOne.mockResolvedValue(null);
      Usuario.findOne.mockResolvedValue({ id_usuario: 1 });

      jwt.sign.mockReturnValue('fake_token');

      await passwordService.sendPasswordResetEmail('medico@correo.com');

      expect(Resend.prototype.emails.send).toHaveBeenCalledWith(expect.objectContaining({
        to: 'awladimircharco@gmail.com',
        subject: expect.any(String),
        text: expect.stringContaining('http://localhost:3000/auth/reset-password/reset?token=fake_token')
      }));
    });

    test('debería lanzar error si el usuario no existe', async () => {
      Medico.findOne.mockResolvedValue(null);
      Administrador.findOne.mockResolvedValue(null);
      Paciente.findOne.mockResolvedValue(null);

      await expect(passwordService.sendPasswordResetEmail('noexiste@correo.com'))
        .rejects
        .toThrow('No se encontró un usuario con este correo.');
    });
  });
  
  const dummyNueva = 'nueva_password';
  describe('resetPassword()', () => {
    test('debería cambiar la contraseña si el token y nombre de usuario son correctos', async () => {
      const token = 'valid_token';
      const nombre_usuario = 'usuario_test';
      const newPassword = dummyNueva;

      jwt.verify.mockReturnValue({ id_usuario: 1 });

      const mockUser = {
        id_usuario: 1,
        nombre_usuario: 'usuario_test',
        save: jest.fn(),
      };

      Usuario.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      await passwordService.resetPassword(token, nombre_usuario, newPassword);

      expect(mockUser.password).toBe('hashedPassword');
      expect(mockUser.save).toHaveBeenCalled();
    });

    test('debería lanzar error si el token es inválido', async () => {
      jwt.verify.mockImplementation(() => { throw new Error('Token inválido'); });

      await expect(passwordService.resetPassword('bad_token', 'user', '1234'))
        .rejects
        .toThrow('No se pudo restablecer la contraseña. Token inválido');
    });

    test('debería lanzar error si el usuario no coincide con el nombre de usuario', async () => {
      jwt.verify.mockReturnValue({ id_usuario: 1 });

      Usuario.findOne.mockResolvedValue({ id_usuario: 1, nombre_usuario: 'otro_usuario' });

      await expect(passwordService.resetPassword('token', 'user_distinto', '1234'))
        .rejects
        .toThrow('El nombre de usuario no coincide con el usuario asociado al restablecimiento.');
    });

    test('debería lanzar error si no se encuentra el usuario', async () => {
      jwt.verify.mockReturnValue({ id_usuario: 1 });
      Usuario.findOne.mockResolvedValue(null);

      await expect(passwordService.resetPassword('token', 'user', '1234'))
        .rejects
        .toThrow('No se encontró el usuario asociado al token.');
    });
  });
});
