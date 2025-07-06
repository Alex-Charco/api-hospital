const request = require('supertest');
const app = require('../../app');
const sequelize = require('../../config/db');
require('dotenv').config({ path: '.env.test' });

const token = process.env.TEST_AUTH_TOKEN || '';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  sequelize.close();
  jest.restoreAllMocks(); // restaurar todos los métodos al final
});

describe('🧪 Pruebas de integración: Cita', () => {

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('GET /api/cita/get/paciente/:identificacionPaciente - con token válido puede responder 200, 204 o 404', async () => {
    const res = await request(app)
      .get('/api/cita/get/paciente/123456789')
      .set('Authorization', `Bearer ${token}`);

    console.log('➡️ GET paciente:', res.statusCode, res.body);

    expect([200, 204, 404]).toContain(res.statusCode);

    if (res.statusCode === 404) {
      expect(res.body).toHaveProperty('message');
    } else {
      expect(Array.isArray(res.body) || typeof res.body === 'object').toBe(true);
    }
  });

  test('POST /api/cita/registrar - sin datos debe fallar con código 400 o mayor', async () => {
    const res = await request(app)
      .post('/api/cita/registrar')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    console.log('➡️ POST registrar cita vacío:', res.statusCode, res.body);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('message');
  });

  test('POST /api/cita/registrar - con datos inválidos (turno no disponible) debe fallar con código 400 o mayor', async () => {
    const res = await request(app)
      .post('/api/cita/registrar')
      .set('Authorization', `Bearer ${token}`)
      .send({ id_turno: 9999, id_paciente: 1 });

    console.log('➡️ POST cita inválido:', res.statusCode, res.body);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message.toLowerCase()).toMatch(/no disponible|error/i);
  });

});
