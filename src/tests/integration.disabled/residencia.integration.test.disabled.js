// src/tests/integration/residencia.integration.test.js
const request = require('supertest');
const app = require('../../app');
const { Usuario, Paciente, Residencia, HistorialCambiosResidencia } = require('../../models');

let tokenTest = 'Bearer TU_TOKEN_VALIDO'; // Reemplaza con un token válido

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks(); // restaurar todos los métodos al final
});

describe('🔰 Pruebas de integración - Residencia', () => {
  let paciente;
  let usuario;
  let identificacion;

  beforeAll(async () => {
    identificacion = `RES${Date.now().toString().slice(-6)}`;

    usuario = await Usuario.create({
      nombre_usuario: `resid_${Date.now()}`,
      password: 'Password-123',
      id_rol: 1,
      estatus: 1
    });

    paciente = await Paciente.create({
      id_usuario: usuario.id_usuario,
      identificacion,
      fecha_nacimiento: '1990-01-01',
      primer_nombre: 'Ana',
      primer_apellido: 'García',
      genero: 'FEMENINO',
      celular: '0987654321',
      correo: 'ana@ejemplo.com',
      estado_civil: 'SOLTERO/A',
      grupo_sanguineo: 'A RH+',
      instruccion: 'SUPERIOR',
      ocupacion: 'MÉDICO',
      discapacidad: false,
      orientacion: 'HETEROSEXUAL',
      identidad: 'CISGÉNERO',
      tipo_paciente: 'CIVIL'
    });
  });

  afterAll(async () => {
    await HistorialCambiosResidencia.destroy({ where: {} });
    await Residencia.destroy({ where: { id_paciente: paciente.id_paciente } });
    await Paciente.destroy({ where: { id_paciente: paciente.id_paciente } });
    await Usuario.destroy({ where: { id_usuario: usuario.id_usuario } });
  });

  test('POST /api/residencia/registrar/:identificacion debe registrar una residencia', async () => {
    const res = await request(app)
      .post(`/api/residencia/registrar/${identificacion}`)
      .set('Authorization', tokenTest)
      .send({
        lugar_nacimiento: 'Cuenca',
        pais: 'Ecuador',
        nacionalidad: 'Ecuatoriana',
        provincia: 'Azuay',
        canton: 'Cuenca',
        parroquia: 'Yanuncay',
        direccion: 'Av. Loja y Av. Solano'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('residencia');
    expect(res.body.residencia.pais).toBe('Ecuador');
  });

  test('GET /api/residencia/get/:identificacion debe obtener la residencia', async () => {
    const res = await request(app)
      .get(`/api/residencia/get/${identificacion}`)
      .set('Authorization', tokenTest);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('pais', 'Ecuador');
  });

  test('PUT /api/residencia/put/:identificacion debe actualizar la residencia', async () => {
    const res = await request(app)
      .put(`/api/residencia/put/${identificacion}`)
      .set('Authorization', tokenTest)
      .send({
        provincia: 'Pichincha',
        canton: 'Quito',
        id_usuario_modificador: usuario.id_usuario
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('residencia');
    expect(res.body.residencia.provincia).toBe('Pichincha');
  });

  test('GET /api/residencia/get/:identificacion debe fallar si no existe residencia', async () => {
    const res = await request(app)
      .get(`/api/residencia/get/NO_EXISTE_${Date.now()}`)
      .set('Authorization', tokenTest);

    expect([404, 500]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('message');
  });
});
