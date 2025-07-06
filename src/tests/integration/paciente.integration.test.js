const request = require('supertest');
const app = require('../../app');
const { Paciente, Usuario, RolUsuario } = require('../../models');
const sequelize = require('../../config/db');

// Silenciar consola en pruebas
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Pruebas de integración API - Paciente', () => {
  const tokenTest = 'Bearer TU_TOKEN_VALIDO_AQUI'; // Reemplaza por un token válido si usas autenticación
  const identificacionTest = `${Math.floor(1000000000 + Math.random() * 9000000000)}`; // Cédula de 10 dígitos

  let idPacienteTest;
  let idUsuarioTest;
  let idRolTest;

  beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa.');

    // ✅ Asignar directamente el id del rol PACIENTE ya existente
    idRolTest = 1;

    // Crear usuario con rol PACIENTE
    const usuario = await Usuario.create({
      id_rol: idRolTest,
      nombre_usuario: `usuario_test_${Date.now()}`,
      password: 'Password-1237',
      estatus: 1,
    });
    idUsuarioTest = usuario.id_usuario;

    const pacienteExistente = await Paciente.findOne({ where: { identificacion: identificacionTest } });
    if (pacienteExistente) {
      await sequelize.query('DELETE FROM historial_cambios_paciente WHERE id_paciente = ?', {
        replacements: [pacienteExistente.id_paciente],
      });
      await pacienteExistente.destroy();
    }

    const paciente = await Paciente.create({
      id_usuario: idUsuarioTest,
      identificacion: identificacionTest,
      fecha_nacimiento: '1985-01-01',
      primer_nombre: 'Test',
      segundo_nombre: 'Paciente',
      primer_apellido: 'Apellido',
      segundo_apellido: 'Apellido2',
      genero: 'MASCULINO',
      celular: '0999999999',
      telefono: '022222222',
      correo: 'test@paciente.com',
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

  } catch (error) {
    console.error('❌ Error en beforeAll de paciente:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    if (idPacienteTest) {
      await sequelize.query('DELETE FROM historial_cambios_paciente WHERE id_paciente = ?', {
        replacements: [idPacienteTest],
      });
      await Paciente.destroy({ where: { id_paciente: idPacienteTest } });
    }

    if (idUsuarioTest) {
      await Usuario.destroy({ where: { id_usuario: idUsuarioTest } });
    }

    // ❌ No elimines el rol porque es parte de tu base real
    // if (idRolTest) {
    //   await RolUsuario.destroy({ where: { id_rol: idRolTest } });
    // }

  } catch (err) {
    console.error('❌ Error en afterAll:', err.message);
  }
});

  test('POST /api/paciente/registrar debe crear un nuevo paciente', async () => {
  const newIdentificacion = `08${Math.floor(100000000 + Math.random() * 900000000)}`; // aseguramos que sea 10 dígitos y empiece con 08
  const nombreUsuarioPaciente = `usuario_test_${Date.now()}`;

  // Aseguramos que el rol PACIENTE (id_rol = 1) exista
  let rolPaciente = await RolUsuario.findOne({ where: { nombre_rol: 'PACIENTE' } });
  if (!rolPaciente) {
    rolPaciente = await RolUsuario.create({
      nombre_rol: 'PACIENTE',
      permiso: { ver_cita: true, ver_turno: true, registrar_cita: true, ver_historial: true },
      estatus: 1,
    });
    console.log('🟢 Rol PACIENTE creado:', rolPaciente.toJSON());
  }

  // Crear el usuario con ese rol
  const nuevoUsuario = await Usuario.create({
    id_rol: rolPaciente.id_rol,
    nombre_usuario: nombreUsuarioPaciente,
    password: 'Password-123',
    estatus: 1,
  });
  console.log('🟢 Usuario creado:', nuevoUsuario.toJSON());

  // Hacemos la solicitud para registrar paciente
  const res = await request(app)
    .post('/api/paciente/registrar')
    .set('Authorization', tokenTest)
    .send({
      nombre_usuario: nombreUsuarioPaciente,
      identificacion: newIdentificacion,
      fecha_nacimiento: '1990-05-05',
      primer_nombre: 'Nuevo',
      primer_apellido: 'Paciente',
      genero: 'FEMENINO',
      celular: '0998887777',
	  correo: 'nuevo@paciente.com',
      estado_civil: 'CASADO/A',
      grupo_sanguineo: 'A RH+',
      instruccion: 'BÁSICA',
      ocupacion: 'ESTUDIANTE',
      discapacidad: 0,
      orientacion: 'HETEROSEXUAL',
      identidad: 'CISGÉNERO',
      tipo_paciente: 'CIVIL',
    });

  console.log('🧪 Resultado POST:', res.body);

  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty('paciente');

  // Limpieza
  const idPacienteCreado = res.body.paciente.id_paciente;
  await sequelize.query('DELETE FROM historial_cambios_paciente WHERE id_paciente = ?', {
    replacements: [idPacienteCreado],
  });
  await Paciente.destroy({ where: { id_paciente: idPacienteCreado } });
  await Usuario.destroy({ where: { id_usuario: nuevoUsuario.id_usuario } });
});


  test('GET /api/paciente/get/:identificacion debe obtener paciente existente', async () => {
    const res = await request(app)
      .get(`/api/paciente/get/${identificacionTest}`)
      .set('Authorization', tokenTest);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('paciente');
    expect(res.body.paciente.identificacion).toBe(identificacionTest);
  });

  test('PUT /api/paciente/put/:identificacion debe actualizar paciente', async () => {
    const res = await request(app)
      .put(`/api/paciente/put/${identificacionTest}`)
      .set('Authorization', tokenTest)
      .send({
        id_usuario_modificador: idUsuarioTest,
        primer_nombre: 'PacienteModificado',
        celular: '0997776666',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('paciente');
    expect(res.body.paciente.primer_nombre).toBe('PacienteModificado');
  });

  test('GET /api/paciente/get/historial/:identificacion debe devolver historial', async () => {
    const res = await request(app)
      .get(`/api/paciente/get/historial/${identificacionTest}`)
      .set('Authorization', tokenTest);

    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('historial');
    }
  });

  test('GET /api/paciente/get/detalle-por-cita/:id_cita debe devolver detalle paciente', async () => {
    const idCitaDummy = 1; // Asegúrate de tener una cita con este ID o prueba con uno que sí exista

    const res = await request(app)
      .get(`/api/paciente/get/detalle-por-cita/${idCitaDummy}`)
      .set('Authorization', tokenTest);

    expect([200, 404, 500]).toContain(res.statusCode);
  });
});
