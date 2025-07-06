// src/tests/integration/turno.integration.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const { JWT_SECRET } = require('../../utils/config');
const { sequelize } = require('../../models');

afterAll(async () => {
  await sequelize.close();
});

describe('🧪 Pruebas de integración - Turno', () => {
  let token;

  beforeAll(() => {
    token = jwt.sign(
      {
        id_usuario: 1,
        rol: 'admin',
        permisos: ['ver_turno']
      },
      JWT_SECRET || 'secreto',
      { expiresIn: '1h' }
    );

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('✅ GET /api/turno/get/disponibles debe devolver turnos disponibles con token válido', async () => {
    const res = await request(app)
      .get('/api/turno/get/disponibles')
      .set('Authorization', token)
      .set('x-test-usuario', 'usuario_prueba')  // Para pasar middleware test
      .expect(200);

    expect(res.body).toHaveProperty('message');
    expect(Array.isArray(res.body.turnos)).toBe(true);
  });

  test('❌ GET /api/turno/get/disponibles debe fallar sin token', async () => {
    // Guardar el env original
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production'; // O cualquier cosa distinta de 'test'

    const res = await request(app)
      .get('/api/turno/get/disponibles')
      // no enviamos token ni x-test-usuario
      .expect(401);

    expect(res.body).toHaveProperty('message');

    // Restaurar env
    process.env.NODE_ENV = originalEnv;
  });
});
