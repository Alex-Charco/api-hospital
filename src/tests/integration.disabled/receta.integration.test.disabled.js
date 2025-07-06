// tests/integration/receta.integration.test.js
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const {
  Usuario,
  RolUsuario,
  Especialidad,
  Medico,
  Paciente,
  Horario,
  Turno,
  Cita,
  NotaEvolutiva,
  sequelize
} = require("../../models");
const { JWT_SECRET } = require("../../utils/config");

let token, usuario, medico, paciente, horario, turno, cita, nota;

beforeAll(async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log("✅ Conexión a la base de datos exitosa.");

    // Crear usuario
    const nombre_usuario = "user_receta_" + Date.now();
    const rol = await RolUsuario.findOne({ where: { id_rol: 2 } });

    usuario = await Usuario.create({
      nombre_usuario,
      password: '$2a$10$HASHFAKEPARATESTS12345678',
      id_rol: rol.id_rol,
      estatus: 1,
      fecha_creacion: new Date()
    });

    // Crear especialidad
    const especialidad = await Especialidad.create({
      nombre: 'MEDICINA GENERAL',         // o el que sea válido en tu enum
      atencion: 'CONSULTA EXTERNA',
      consultorio: 'CONSULTORIO 1 MEDICINA GENERAL'
    });

    // Crear médico
    medico = await Medico.create({
      id_usuario: usuario.id_usuario,
      id_especialidad: especialidad.id_especialidad,
      identificacion: "MED" + Date.now().toString().slice(-6),
      fecha_nacimiento: "1985-01-01",
      primer_nombre: "Ana",
      segundo_nombre: "Lucía",
      primer_apellido: "Reyes",
      segundo_apellido: "Díaz",
      genero: "FEMENINO",
      reg_msp: "MSP98765",
      celular: "0998887777",
      telefono: "022334455",
      correo: "ana.reyes@example.com",
      estatus: 1
    });

    // Crear paciente
    paciente = await Paciente.create({
      id_usuario: usuario.id_usuario,
      identificacion: "RECETA" + Math.floor(Math.random() * 999999),
      primer_nombre: "Pedro",
      segundo_nombre: "Luis",
      primer_apellido: "Martínez",
      segundo_apellido: "Flores",
      fecha_nacimiento: "1991-05-05",
      genero: "MASCULINO",
      celular: "0987654321",
      telefono: "022211100",
      correo: "pedro.martinez@example.com",
      estado_civil: "SOLTERO/A",
      grupo_sanguineo: "O RH+",
      instruccion: "SUPERIOR",
      ocupacion: "ABOGADO",
      discapacidad: false,
      orientacion: "HETEROSEXUAL",
      identidad: "CISGÉNERO",
      tipo_paciente: "CIVIL",
      estatus: 1
    });

    // Crear horario
    horario = await Horario.create({
      dia: "LUNES",
      hora_inicio: "08:00:00",
      hora_fin: "10:00:00",
      intervalo_minutos: 30,
      id_medico: medico.id_medico,
      institucion: "HB 17 PASTAZA",
      fecha_horario: new Date(),
      consulta_maxima: 4
    });

    // Crear turno
    turno = await Turno.create({
      id_horario: horario.id_horario,
      numero_turno: 1,
      hora_turno: "08:00:00",
      estado: "DISPONIBLE"
    });

    // Crear cita
    cita = await Cita.create({
      id_paciente: paciente.id_paciente,
      id_turno: turno.id_turno,
      estado: "ASIGNADA"
    });

    // Crear nota evolutiva
    nota = await NotaEvolutiva.create({
      id_cita: cita.id_cita,
      motivo_consulta: "Dolor lumbar",
      enfermedad: "Lumbalgia",
      tratamiento: "Reposo + Ibuprofeno",
      resultado_examen: "Radiografía normal",
      decision_consulta: "Reposo",
      reporte_decision: "Reposo por 3 días"
    });

    // Crear token manual
    token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        rol: { id_rol: 2, nombre_rol: "MEDICO", permiso: { gestionar_receta: true } }
      },
      JWT_SECRET || "secreto",
      { expiresIn: "1h" }
    );
  } catch (error) {
    console.error("💥 Error en beforeAll:", error);
    throw error;
  }
});

afterAll(async () => {
  try {
    if (nota) await NotaEvolutiva.destroy({ where: { id_nota_evolutiva: nota.id_nota_evolutiva } });
    if (cita) await Cita.destroy({ where: { id_cita: cita.id_cita } });
    if (paciente) await Paciente.destroy({ where: { id_paciente: paciente.id_paciente } });
    if (usuario) await Usuario.destroy({ where: { id_usuario: usuario.id_usuario } });
    await sequelize.close();
  } catch (error) {
    console.error("❌ Error al limpiar:", error);
  }
  jest.restoreAllMocks();
});

describe("🧪 Pruebas integración - Receta", () => {
  test("✅ POST /api/receta/registrar debería registrar receta correctamente", async () => {
    const res = await request(app)
      .post("/api/receta/registrar")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id_nota_evolutiva: nota.id_nota_evolutiva,
        fecha_prescripcion: new Date().toISOString(),
        medicaciones: [
          {
            medicamento: {
              nombre_medicamento: "Paracetamol",
              cum: "456",
              forma_farmaceutica: "Tableta",
              via_administracion: "Oral",
              concentracion: "500mg",
              presentacion: "Caja x20",
              tipo: "AGUDO",
              cantidad: 20
            },
            indicacion: "Tomar 1 cada 8h",
            posologias: [
              {
                dosis_numero: 1,
                dosis_tipo: "TABLETA",
                frecuencia_numero: 8,
                frecuencia_tipo: "HORAS",
                duracion_numero: 3,
                duracion_tipo: "DÍAS",
                fecha_inicio: new Date().toISOString().split("T")[0],
                hora_inicio: "08:00:00",
                via: "ORAL",
              }
            ]
          }
        ],
        receta_autorizacion: {
          tipo_autorizado: "PACIENTE",
          id_paciente: paciente.id_paciente
        }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.receta).toBeDefined();
    expect(res.body.medicacionesGuardadas.length).toBeGreaterThan(0);
  });

  test("❌ POST /api/receta/registrar sin cuerpo debería fallar", async () => {
    const res = await request(app)
      .post("/api/receta/registrar")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/faltan/i);
  });
});
