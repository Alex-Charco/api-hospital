const request = require('supertest');
const app = require('../../app');
const {
  Usuario,
  Paciente,
  Seguro,
  HistorialCambiosSeguro,
} = require('../../models');

let tokenTest = 'Bearer TU_TOKEN_VALIDO'; // ⚠️ Reemplaza con un token real si usas auth

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks(); // restaurar todos los métodos al final
});

describe('🔐 Pruebas de integración - Seguro', () => {
  let usuario;
  let paciente;
  let identificacion;

  beforeAll(async () => {
    identificacion = `SEG${Date.now().toString().slice(-6)}`;

    usuario = await Usuario.create({
      nombre_usuario: `test_seg_${Date.now()}`,
      password: 'Password-123',
      id_rol: 1,
      estatus: 1,
    });

    paciente = await Paciente.create({
      id_usuario: usuario.id_usuario,
      identificacion,
      fecha_nacimiento: '1980-01-01',
      primer_nombre: 'Luis',
      primer_apellido: 'Martínez',
      genero: 'MASCULINO',
      celular: '0999999999',
      correo: 'luis@correo.com',
      estado_civil: 'CASADO/A',
      grupo_sanguineo: 'O RH+',
      instruccion: 'SUPERIOR',
      ocupacion: 'ABOGADO',
      discapacidad: false,
      orientacion: 'HETEROSEXUAL',
      identidad: 'CISGÉNERO',
      tipo_paciente: 'MILITAR'
    });
  });

  afterAll(async () => {
    await HistorialCambiosSeguro.destroy({ where: {} });
    await Seguro.destroy({ where: { id_paciente: paciente.id_paciente } });
    await Paciente.destroy({ where: { id_paciente: paciente.id_paciente } });
    await Usuario.destroy({ where: { id_usuario: usuario.id_usuario } });
  });

  test('POST /api/seguro/registrar/:identificacion debe registrar un seguro', async () => {
    const seguroData = {
      tipo: 'SEGURO ISSFA',
      beneficiario: 'MILITAR ACTIVO',
      codigo: 'ABC123',
      cobertura: 80.5,
      porcentaje: 80.5,
      fecha_inicio: '2024-07-01',
      fecha_fin: '2025-07-01',
    };

    const res = await request(app)
      .post(`/api/seguro/registrar/${identificacion}`)
      .set('Authorization', tokenTest)
      .send(seguroData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('seguro');
    expect(res.body.seguro.tipo).toBe('SEGURO ISSFA');
  });

  test('GET /api/seguro/get/:identificacion debe obtener datos del seguro', async () => {
    const res = await request(app)
      .get(`/api/seguro/get/${identificacion}`)
      .set('Authorization', tokenTest);

    expect(res.statusCode).toBe(200);
    expect(res.body.tipo).toBe('SEGURO ISSFA');
    expect(res.body.beneficiario).toBe('MILITAR ACTIVO');
  });

  test('PUT /api/seguro/put/:identificacion debe actualizar seguro', async () => {
    const res = await request(app)
      .put(`/api/seguro/put/${identificacion}`)
      .set('Authorization', tokenTest)
      .send({
        tipo: 'SEGURO ISSFA',
        porcentaje: 90.0,
        id_usuario_modificador: usuario.id_usuario
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.seguro.tipo).toBe('SEGURO ISSFA');
    expect(parseFloat(res.body.seguro.porcentaje)).toBe(90.0);
  });

  test('POST /api/seguro/registrar/:identificacion debe fallar si ya existe seguro', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn(); // silencia errores
	
	const res = await request(app)
      .post(`/api/seguro/registrar/${identificacion}`)
      .set('Authorization', tokenTest)
      .send({
        tipo: 'SEGURO ISSFA',
        beneficiario: 'MILITAR ACTIVO',
        codigo: 'REPETIDO',
        cobertura: 80.0,
        porcentaje: 80.0,
        fecha_inicio: '2024-07-01',
        fecha_fin: '2025-07-01',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/ya tiene un seguro registrado/i);
	
	console.error = originalConsoleError;
  });
});
