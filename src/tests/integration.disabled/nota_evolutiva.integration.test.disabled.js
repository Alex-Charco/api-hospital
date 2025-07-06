const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
//const { Op } = require("sequelize");
const {
  RolUsuario,
  Usuario,
  Paciente,
  Turno,
  Horario,
  Cita,
  Asistencia,
  sequelize,
  Especialidad,
  Medico
} = require('../../models');
const { JWT_SECRET } = require('../../utils/config');

let token, paciente, cita, turno, usuario, asistencia, medico;

beforeAll(async () => {
	jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log('✅ Conexión a la base de datos exitosa.');

    // Crear usuario médico
    const nombre_usuario = 'user_nota_' + Date.now();
    const rol = await RolUsuario.findOne({ where: { id_rol: 2 } });
    if (!rol) throw new Error('❌ No se encontró el rol con id_rol=2');

    usuario = await Usuario.create({
      nombre_usuario,
      password: '$2a$10$DUMMYHASH12345678901234567890HASHEDPASS',
      id_rol: rol.id_rol,
      estatus: 1,
      fecha_creacion: new Date()
    });

    // Crear especialidad necesaria para médico
    const especialidad = await Especialidad.create({
      nombre: 'MEDICINA GENERAL',         // o el que sea válido en tu enum
      atencion: 'CONSULTA EXTERNA',
      consultorio: 'CONSULTORIO 1 MEDICINA GENERAL'
    });

    // Crear médico referenciando usuario y especialidad
    medico = await Medico.create({
      id_usuario: usuario.id_usuario,
      id_especialidad: especialidad.id_especialidad,
      identificacion: 'MED' + Date.now().toString().slice(-6),
      fecha_nacimiento: '1980-01-01',
      primer_nombre: 'Juan',
      segundo_nombre: 'Carlos',
      primer_apellido: 'Pérez',
      segundo_apellido: 'Gómez',
      genero: 'MASCULINO',
      reg_msp: 'REG123456',
      celular: '0999999999',
      telefono: '022222222',
      correo: 'juan.perez@example.com',
      estatus: 1
    });

    // Crear paciente
    const identificacionUnica = 'NOTA' + Math.floor(Math.random() * 999999);
    paciente = await Paciente.create({
      id_usuario: usuario.id_usuario,
      identificacion: identificacionUnica,
      primer_nombre: 'Carlos',
      segundo_nombre: 'Luis',
      primer_apellido: 'Gomez',
      segundo_apellido: 'Mora',
      fecha_nacimiento: '1990-01-01',
      genero: 'MASCULINO',
      celular: '0999999999',
      telefono: '022222222',
      correo: 'carlos@example.com',
      estado_civil: 'CASADO/A',
      grupo_sanguineo: 'A RH+',
      instruccion: 'SUPERIOR',
      ocupacion: 'INGENIERO',
      discapacidad: false,
      orientacion: 'HETEROSEXUAL',
      identidad: 'CISGÉNERO',
      tipo_paciente: 'CIVIL',
      estatus: 1
    });

    // Crear horario con id_medico correcto
    const horario = await Horario.create({
      dia: 'LUNES',
      hora_inicio: '08:00',
      hora_fin: '10:00',
      intervalo_minutos: 30,
      id_medico: medico.id_medico, // <-- CORRECTO: usar medico.id_medico aquí
      institucion: 'HB 17 PASTAZA',
      fecha_horario: new Date(),
      consulta_maxima: 4
    });

    // Crear turno usando el horario
    turno = await Turno.create({
  id_horario: horario.id_horario,
  numero_turno: 1,           // número del turno, ej: primer turno del horario
  hora_turno: '10:00:00',    // hora en formato HH:mm:ss (tipo TIME en MySQL)
  estado: 'DISPONIBLE'
});


    // Verificar que no exista ya una cita con ese turno
    const existeCita = await Cita.findOne({ where: { id_turno: turno.id_turno } });
    if (existeCita) throw new Error(`❌ El turno ${turno.id_turno} ya está asignado a una cita`);

    // Crear cita
    console.log('📌 Creando cita con:', {
      id_paciente: paciente.id_paciente,
      id_turno: turno.id_turno
    });

    cita = await Cita.create({
      id_paciente: paciente.id_paciente,
      id_turno: turno.id_turno
    });

    console.log('✅ Cita creada:', cita.toJSON());

    // Crear asistencia
    asistencia = await Asistencia.create({
      id_cita: cita.id_cita,
      estado_asistencia: 'CONFIRMADA',
      comentario: 'Asistencia registrada automáticamente para test.'
    });

    // Crear token
    token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        rol: { id_rol: 2, nombre_rol: 'MEDICO', permiso: { gestionar_historial: true } }
      },
      JWT_SECRET || 'secreto',
      { expiresIn: '1h' }
    );
  } catch (error) {
    console.error('💥 Error en beforeAll:', error);
    throw error;
  }
});
afterAll(async () => {
  try {
    if (asistencia) await Asistencia.destroy({ where: { id_asistencia: asistencia.id_asistencia } });
    if (cita) await Cita.destroy({ where: { id_cita: cita.id_cita } });
    if (paciente) await Paciente.destroy({ where: { id_paciente: paciente.id_paciente } });
    if (usuario) await Usuario.destroy({ where: { id_usuario: usuario.id_usuario } });
    await sequelize.close();
  } catch (e) {
    console.error('❌ Error al limpiar:', e);
  }
  jest.restoreAllMocks();
});

describe('🧪 Pruebas integración - Nota Evolutiva', () => {
  let notaId;

  test('✅ POST /api/nota-evolutiva/registrar', async () => {
    const res = await request(app)
      .post('/api/nota-evolutiva/registrar')
      .set('Authorization', `Bearer ${token}`)
      .send({
        id_cita: cita.id_cita,
        motivo_consulta: 'Dolor de cabeza persistente',
        enfermedad: 'Migraña crónica',
        tratamiento: 'Paracetamol',
        resultado_examen: 'Sin hallazgos',
        decision_consulta: 'Reposo',
        reporte_decision: 'Reposo 2 días',
        signo_vital: {
          peso: 70,
          talla: 170,
          temperatura: 37,
          frecuencia_cardiaca: 75,
          presion_arterial: '120/80'
        },
        diagnosticos: [
          {
            condicion: 'Confirmado',
            tipo: 'PRINCIPAL',
            cie_10: 'G43.0',
            descripcion: 'Migraña sin aura',
            procedimientos: [
              { codigo: '99213', descripcion_proc: 'Consulta médica' }
            ]
          }
        ],
        links: [
          {
            categoria: 'EXAMEN',
            nombre_documento: 'TAC',
            url: 'http://localhost/tac.pdf',
            descripcion: 'Sin hallazgos'
          }
        ]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('nota');
    notaId = res.body.nota.id_nota_evolutiva;
  });

  test('✅ GET /api/nota-evolutiva/get', async () => {
    const res = await request(app)
      .get(`/api/nota-evolutiva/get?id_cita=${cita.id_cita}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('✅ GET /api/nota-evolutiva/get/nota/:id', async () => {
    const res = await request(app)
      .get(`/api/nota-evolutiva/get/nota/${notaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('Diagnosticos');
  });
});
