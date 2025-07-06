// tests/integration/auth.integration.test.js
const request = require('supertest');
const app = require('../../app');
const { Usuario, RolUsuario, sequelize } = require('../../models');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks(); // restaurar todos los métodos al final
});

describe('🔐 Pruebas de integración - Auth', () => {
  let usuarioAdmin;
  let nombre_usuario;

  beforeAll(async () => {
    await sequelize.sync({ force: false });

    nombre_usuario = 'testuser_' + Date.now();

    const rol = await RolUsuario.findOne();

    usuarioAdmin = await Usuario.create({
      nombre_usuario,
      password: '$2a$10$DUMMYHASHFORTESTING12345678901234567890123456789012345678', // Hash dummy
      id_rol: rol.id_rol,
      estatus: 1,
      fecha_creacion: new Date()
    });
  });

  afterAll(async () => {
    await Usuario.destroy({ where: { nombre_usuario } });
    await sequelize.close();
  });

  test('POST /api/auth/register debe registrar un nuevo usuario', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('x-test-usuario', nombre_usuario) // Middleware lo usará
      .send({
        nombre_usuario: 'nuevo_' + Date.now(),
        password: 'Password-123',
        id_rol: usuarioAdmin.id_rol
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('usuario');
  });

  test('GET /api/auth/get/:nombre_usuario debe obtener un usuario', async () => {
    const res = await request(app)
      .get(`/api/auth/get/${nombre_usuario}`)
      .set('x-test-usuario', nombre_usuario);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('nombre_usuario', nombre_usuario);
  });

  test('PUT /api/auth/put/estatus/:nombre_usuario debe actualizar estatus', async () => {
    const res = await request(app)
      .put(`/api/auth/put/estatus/${nombre_usuario}`)
      .set('x-test-usuario', nombre_usuario)
      .send({ estatus: 0 });

    expect(res.statusCode).toBe(200);
    expect(res.body.usuario.estatus).toBe(0);
  });

  test('PUT /api/auth/put/password/:nombre_usuario debe fallar por password actual incorrecta', async () => {
    const res = await request(app)
      .put(`/api/auth/put/password/${nombre_usuario}`)
      .set('x-test-usuario', nombre_usuario)
      .send({
        password_actual: 'malaclave',
        nueva_password: 'Password-Nueva123'
      });

    expect(res.statusCode).toBe(401); // ← Ahora sí será 401, no 403
    expect(res.body.message).toMatch(/contraseña actual/i);
  });

  test('POST /api/auth/login debe fallar si usuario no existe', async () => {
    const res = await request(app).post('/api/auth/login').send({
      nombre_usuario: 'noexiste_' + Date.now(),
      password: 'fakepass'
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/credenciales inválidas/i);
  });
});
