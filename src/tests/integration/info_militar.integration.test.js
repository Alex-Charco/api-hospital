const request = require('supertest');
const app = require('../../app');
const {
  Usuario,
  Paciente,
  InfoMilitar,
  HistorialCambiosInfoMilitar,
} = require('../../models');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks(); // restaurar todos los métodos al final
});

describe('🔰 Pruebas de integración - Información Militar', () => {
  let tokenTest = 'Bearer TU_TOKEN_VALIDO'; // reemplaza con un token válido
  let identificacionTest;
  let usuarioTest;
  let pacienteTest;
  let idUsuarioTest;

  beforeAll(async () => {
    identificacionTest = `MIL${Date.now().toString().slice(-6)}`;

    usuarioTest = await Usuario.create({
      nombre_usuario: `militar_${Date.now()}`,
      password: 'Password-123',
      id_rol: 1,
      estatus: 1,
    });

    idUsuarioTest = usuarioTest.id_usuario;

    pacienteTest = await Paciente.create({
      id_usuario: idUsuarioTest,
      identificacion: identificacionTest,
      fecha_nacimiento: '1990-01-01',
      primer_nombre: 'Juan',
      primer_apellido: 'Pérez',
      genero: 'MASCULINO',
      celular: '0987654321',
      correo: 'militar@ejemplo.com',
      estado_civil: 'SOLTERO/A',
      grupo_sanguineo: 'O RH+',
      instruccion: 'BÁSICA',
      ocupacion: 'ESTUDIANTE',
      discapacidad: false,
      orientacion: 'HETEROSEXUAL',
      identidad: 'CISGÉNERO',
      tipo_paciente: 'MILITAR' // ✅ CORREGIDO
    });

    console.log('🟢 Paciente militar creado:', pacienteTest.toJSON());
  });

  afterAll(async () => {
    await HistorialCambiosInfoMilitar.destroy({ where: {} });
    await InfoMilitar.destroy({ where: { id_paciente: pacienteTest.id_paciente } });
    await Paciente.destroy({ where: { id_paciente: pacienteTest.id_paciente } });
    await Usuario.destroy({ where: { id_usuario: idUsuarioTest } });
  });

  test('POST /api/info-militar/registrar debe registrar info militar', async () => {
    const res = await request(app)
      .post('/api/info-militar/registrar')
      .set('Authorization', tokenTest)
      .send({
        identificacion: identificacionTest,
        cargo: 'TENIENTE CORONEL',
        grado: 'CORONEL',
        fuerza: 'TERRESTRE',
        unidad: '15-BAE'
      });

    console.log('🧪 POST registrar info militar:', res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('infoMilitar');
    expect(res.body.infoMilitar.cargo).toBe('TENIENTE CORONEL');
  });

  test('GET /api/info-militar/get/:identificacion debe devolver info militar', async () => {
    const res = await request(app)
      .get(`/api/info-militar/get/${identificacionTest}`)
      .set('Authorization', tokenTest);

    console.log('📥 GET info militar:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('cargo', 'TENIENTE CORONEL');
  });

  test('PUT /api/info-militar/put/:identificacion debe actualizar info militar', async () => {
    const res = await request(app)
      .put(`/api/info-militar/put/${identificacionTest}`)
      .set('Authorization', tokenTest)
      .send({
        cargo: 'SUBOFICIAL', // ✅ Valor permitido del ENUM
        unidad: '15-BAE',
        id_usuario_modificador: idUsuarioTest,
      });

    console.log('🔄 PUT info militar:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.infoMilitar.cargo).toBe('SUBOFICIAL');
  });

  test('POST /api/info-militar/registrar debe fallar si el paciente no es militar', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  // Crear nuevo usuario para el paciente civil
  const usuarioCivil = await Usuario.create({
    nombre_usuario: `civil_${Date.now()}`,
    password: 'Password-123',
    id_rol: 1,
    estatus: 1,
  });

  const pacienteCivil = await Paciente.create({
    id_usuario: usuarioCivil.id_usuario,
    identificacion: `NO${Date.now()}`,
    primer_nombre: 'Pedro',
    primer_apellido: 'López',
    tipo_paciente: 'CIVIL',
    fecha_nacimiento: '1992-01-01',
    celular: '0999999999',
    correo: 'no@militar.com',
    genero: 'MASCULINO',
    estado_civil: 'CASADO/A',
    grupo_sanguineo: 'A RH+',
    instruccion: 'BÁSICA',
    ocupacion: 'ESTUDIANTE',
    discapacidad: false,
    orientacion: 'HETEROSEXUAL',
    identidad: 'CISGÉNERO'
  });

  const res = await request(app)
    .post('/api/info-militar/registrar')
    .set('Authorization', tokenTest)
    .send({
      identificacion: pacienteCivil.identificacion,
      cargo: 'Sargento',
      grado: 'Tropa',
      fuerza: 'Naval',
      unidad: 'Escuadra Azul',
    });

  console.log('🛑 Error por paciente no militar:', res.body);

  expect(res.statusCode).toBe(500); // o el código que esperes si validas como 400/403
  expect(res.body.message).toMatch(/militar/i);

  // Limpieza
  await Paciente.destroy({ where: { id_paciente: pacienteCivil.id_paciente } });
  await Usuario.destroy({ where: { id_usuario: usuarioCivil.id_usuario } });
  spy.mockRestore();
});

});
