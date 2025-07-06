// tests/integration/password.integration.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const { Usuario, Paciente, sequelize } = require('../../models');
const { JWT_SECRET } = require('../../utils/config');
const bcrypt = require('bcryptjs');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks(); // restaurar todos los métodos al final
});

describe('🔐 Pruebas de integración - Password Reset', () => {
  // eslint-disable-next-line no-unused-vars
  let usuario, paciente, token;

  const correo = `test_${Date.now()}@correo.com`;
  const nombre_usuario = `testuser_${Date.now()}`;
  const password = 'Password-123';

  beforeAll(async () => {
    await sequelize.sync({ force: false });

    usuario = await Usuario.create({
      nombre_usuario,
      password: await bcrypt.hash(password, 10),
      id_rol: 1,
      estatus: 1,
      fecha_creacion: new Date()
    });

    paciente = await Paciente.create({
      id_usuario: usuario.id_usuario,
      identificacion: 'ABC12345',
      primer_nombre: 'Juan',
      primer_apellido: 'Pérez',
      fecha_nacimiento: '1990-01-01',
      genero: 'MASCULINO',
      celular: '0999999999',
      correo,
      estado_civil: 'SOLTERO/A',
      grupo_sanguineo: 'O RH+',
      instruccion: 'SUPERIOR',
      ocupacion: 'DOCENTE',
      discapacidad: false,
      orientacion: 'HETEROSEXUAL',
      identidad: 'CISGÉNERO',
      tipo_paciente: 'MILITAR'
    });

    token = jwt.sign({ id_usuario: usuario.id_usuario }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await Paciente.destroy({ where: { id_usuario: usuario.id_usuario } });
    await Usuario.destroy({ where: { id_usuario: usuario.id_usuario } });
  });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('POST /auth/request-password-reset debe enviar email si correo es válido', async () => {
    const res = await request(app)
      .post('/auth/request-password-reset')
      .send({ email: correo });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/recibirás un enlace/i);
  });

  test('POST /auth/request-password-reset debe fallar si el correo no existe', async () => {
    const res = await request(app)
      .post('/auth/request-password-reset')
      .send({ email: 'noexiste@example.com' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/no se encontró un usuario/i);
  });

  test('POST /auth/reset-password debe restablecer contraseña con token válido', async () => {
    const res = await request(app)
      .post('/auth/reset-password')
      .send({
        token,
        nombre_usuario,
        newPassword: 'NuevaPassword456'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/contraseña restablecida/i);
  });

  test('POST /auth/reset-password debe fallar si username no coincide', async () => {
    const res = await request(app)
      .post('/auth/reset-password')
      .send({
        token,
        nombre_usuario: 'otro_usuario',
        newPassword: 'Password789'
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/no coincide/i);
  });

  test('POST /auth/reset-password debe fallar con token inválido', async () => {
    const res = await request(app)
      .post('/auth/reset-password')
      .send({
        token: 'token_invalido',
        nombre_usuario,
        newPassword: 'Password123'
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/token inválido|no se pudo restablecer/i);
  });
});
