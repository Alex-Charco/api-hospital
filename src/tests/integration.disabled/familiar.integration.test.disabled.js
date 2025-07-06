const request = require('supertest');
const app = require('../../app');
const { Familiar, Paciente, Usuario, RolUsuario } = require('../../models');
//const sequelize = require('../../config/db');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks(); // restaurar todos los métodos al final
});

describe('Pruebas de integración API - Familiar', () => {
  let identificacionUnica;
  let identificacionPacienteTest;
  let idRolTest;
  let idUsuarioTest;
  let idPacienteTest;
  //let idFamiliarTest;

  const tokenTest = 'Bearer TU_TOKEN_VALIDO_AQUI'; // reemplaza si usas auth

  beforeAll(async () => {
    identificacionUnica = `0804578349`;
    identificacionPacienteTest = `P0804578769`;

    try {
      const rol = await RolUsuario.create({
        nombre_rol: 'rol_test',
        permiso: {},
        estatus: 1,
      });
      idRolTest = rol.id_rol;
      console.log('🟢 Rol creado:', rol.toJSON());

      const usuario = await Usuario.create({
        id_rol: idRolTest,
        nombre_usuario: `usuario_test_${Date.now()}`,
        password: 'Password-123',
        estatus: 1,
      });
      idUsuarioTest = usuario.id_usuario;
      console.log('🟢 Usuario creado:', usuario.toJSON());

      const paciente = await Paciente.create({
        id_usuario: idUsuarioTest,
        identificacion: identificacionPacienteTest,
        fecha_nacimiento: '1985-01-01',
        primer_nombre: 'Pedro',
        segundo_nombre: 'Carlos',
        primer_apellido: 'López',
        segundo_apellido: 'García',
        genero: 'MASCULINO',
        celular: '0991112233',
        telefono: '022345678',
        correo: 'paciente@demo.com',
        estatus: 1,
        estado_civil: 'SOLTERO/A',
        grupo_sanguineo: 'O RH+',
        instruccion: 'BÁSICA',
        ocupacion: 'ESTUDIANTE',
        discapacidad: 0,
        orientacion: 'HETEROSEXUAL',
        identidad: 'CISGÉNERO',
        tipo_paciente: 'CIVIL',
      });

      idPacienteTest = paciente.id_paciente;
      console.log('🟢 Paciente creado:', paciente.toJSON());
    } catch (err) {
      console.error('❌ Error en beforeAll:', err.message);
      throw err;
    }
  });

  afterAll(async () => {
    try {
      if (identificacionUnica) {
        await Familiar.destroy({ where: { identificacion: identificacionUnica } });
      }
      if (idPacienteTest) {
        await Paciente.destroy({ where: { id_paciente: idPacienteTest } });
      }
      if (idUsuarioTest) {
        await Usuario.destroy({ where: { id_usuario: idUsuarioTest } });
      }
      if (idRolTest) {
        await RolUsuario.destroy({ where: { id_rol: idRolTest } });
      }
    } catch (err) {
      console.error('❌ Error en afterAll:', err.message);
    }
  });

  test('POST /api/familiar/registrar/:identificacionPaciente debe registrar un familiar', async () => {
    const res = await request(app)
      .post(`/api/familiar/registrar/${identificacionPacienteTest}`)
      .set('Authorization', tokenTest)
      .send({
        identificacion: identificacionUnica,
        primer_nombre: 'Ana',
        segundo_nombre: 'Lucía',
        primer_apellido: 'Torres',
        segundo_apellido: 'Mendoza',
        fecha_nacimiento: '1990-01-01',
        genero: 'FEMENINO',
        celular: '0987654321',
        telefono: '022123456',
        correo: 'ana@test.com',
        relacion: 'MADRE',
        direccion: 'Calle Falsa 123',
      });

    console.log('🔎 POST response body:', res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.familiar).toHaveProperty('id_familiar');

    // guardar ID para siguiente prueba
    //idFamiliarTest = res.body.familiar.id_familiar;
  });

  test('GET /api/familiar/get/:identificacion debe devolver un familiar', async () => {
    const res = await request(app)
      .get(`/api/familiar/get/${identificacionPacienteTest}`)
      .set('Authorization', tokenTest);

    console.log('🔎 GET response body:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.identificacion).toBe(identificacionUnica);
  });

  test('PUT /api/familiar/put/:identificacionPaciente debe actualizar un familiar', async () => {
    const res = await request(app)
      .put(`/api/familiar/put/${identificacionPacienteTest}`)
      .set('Authorization', tokenTest)
      .send({
        identificacion: identificacionUnica,
        primer_nombre: 'Anita',
        celular: '0999999999',
        id_usuario_modificador: idUsuarioTest, // ✅ requerido por backend
      });

    console.log('🔎 PUT response body:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.familiar.primer_nombre).toBe('Anita');
  });

  test('GET /api/familiar/get/:identificacion devuelve 404 si no existe', async () => {
    const res = await request(app)
      .get('/api/familiar/get/identificacion_inexistente')
      .set('Authorization', tokenTest);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/no encontrado/i);
  });
});
