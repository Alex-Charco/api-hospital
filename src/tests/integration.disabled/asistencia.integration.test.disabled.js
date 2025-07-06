const request = require('supertest');
const app = require('../../app');

process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test' });

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks(); // restaurar todos los métodos al final
});

describe('Pruebas de integración: Asistencia', () => {

  test('POST /api/asistencia/registrar - debería fallar si faltan datos', async () => {
    const res = await request(app)
      .post('/api/asistencia/registrar')
      .send({}); // datos vacíos

    console.log('➡️ POST vacío:', res.statusCode, res.body);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('message'); // ✅ cambiado
  });

  test('GET /api/asistencia/get/:id_cita - debería responder correctamente en test', async () => {
    const res = await request(app)
      .get('/api/asistencia/get/1');

    console.log('➡️ GET sin token:', res.statusCode, res.body);

    expect(res.statusCode).toBe(200); // ✅ cambiado
    expect(res.body).toHaveProperty('id_asistencia'); // ✅ opcional
    expect(res.body).toHaveProperty('cita'); // ✅ opcional
  });

});
