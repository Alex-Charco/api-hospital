const request = require("supertest");
const app = require("../../app");
const {
  Usuario,
  Medico,
  Especialidad,
  Horario,
  HistorialCambiosMedico,
} = require("../../models");

const tokenTest = "Bearer TU_TOKEN_VALIDO_AQUI"; // ✅ reemplazar por token real
let usuario, especialidad, medico, horario;
const identificacion = `MED${Date.now().toString().slice(-6)}`;

describe("⏰ Pruebas de integración - Horario", () => {
  beforeAll(async () => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      // Crear especialidad
      especialidad = await Especialidad.create({
        nombre: "MEDICINA GENERAL",
        atencion: "CONSULTA EXTERNA",
        consultorio: "CONSULTORIO 1 MEDICINA GENERAL",
      });

      // Crear usuario
      usuario = await Usuario.create({
        nombre_usuario: `usuario_test_${Date.now()}`,
        password: "Password-123",
        id_rol: 2,
        estatus: 1,
      });

      // Registrar médico usando API (igual que el test correcto que compartiste)
      const res = await request(app)
        .post("/api/medico/registrar")
        .set("Authorization", tokenTest)
        .send({
          nombre_usuario: usuario.nombre_usuario,
          id_especialidad: especialidad.id_especialidad,
          identificacion,
          fecha_nacimiento: "1990-01-01",
          primer_nombre: "Ana",
          segundo_nombre: "Luisa",
          primer_apellido: "Gómez",
          segundo_apellido: "Mora",
          genero: "FEMENINO",
          celular: "0999999999",
          telefono: "022345678",
          correo: `medico_test_${Date.now()}@correo.com`,
          estatus: 1,
          reg_msp: "REG12345",
        });

      if (res.statusCode !== 201) {
        console.error("❌ Registro médico falló:", res.body.message);
      }

      medico = res.body.medico;
    } catch (error) {
      console.error("❌ Error en beforeAll:", error.message);
    }
  });

  afterAll(async () => {
    try {
      await HistorialCambiosMedico.destroy({ where: {} });
      if (horario) await Horario.destroy({ where: { id_horario: horario.id_horario } });
      if (medico) await Medico.destroy({ where: { id_medico: medico.id_medico } });
      if (usuario) await Usuario.destroy({ where: { id_usuario: usuario.id_usuario } });
      if (especialidad) await Especialidad.destroy({ where: { id_especialidad: especialidad.id_especialidad } });

      jest.restoreAllMocks();
    } catch (e) {
      console.error("❌ Error en afterAll:", e.message);
    }
  });

  test("✅ Verificar que el médico fue creado y existe", async () => {
    const encontrado = await Medico.findOne({ where: { identificacion } });
    expect(encontrado).not.toBeNull();
    expect(encontrado.identificacion).toBe(identificacion);
  });

  test("POST /api/horario/registrar/:identificacion debe registrar horario", async () => {
    const res = await request(app)
      .post(`/api/horario/registrar/${identificacion}`)
      .set("Authorization", tokenTest)
      .send({
        institucion: "C.S. A FM MAS",
        fecha_horario: "2025-07-10",
        hora_inicio: "08:00",
        hora_fin: "12:00",
        consulta_maxima: 10,
      });

    if (res.statusCode !== 201) {
      console.error("❌ Error registrar horario:", {
        status: res.statusCode,
        body: res.body,
        identificacionUsada: identificacion,
      });
    }

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("horario");
    horario = res.body.horario;
  });

  test("GET /api/horario/get/:identificacion debe obtener horarios", async () => {
    const res = await request(app)
      .get(`/api/horario/get/${identificacion}`)
      .set("Authorization", tokenTest);

    if (res.statusCode !== 200) {
      console.error("❌ Error obtener horarios:", {
        status: res.statusCode,
        body: res.body,
      });
    }

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("horarios");
    expect(Array.isArray(res.body.horarios)).toBe(true);
  });

  test("PUT /api/horario/put/:id_horario debe editar horario", async () => {
    if (!horario || !horario.id_horario) {
      return console.warn("⚠️ Horario no creado, se omite prueba PUT.");
    }

    const res = await request(app)
      .put(`/api/horario/put/${horario.id_horario}`)
      .set("Authorization", tokenTest)
      .send({
        id_medico: medico.id_medico,
        fecha_horario: "2025-07-11",
        hora_inicio: "09:00",
        hora_fin: "13:00",
        institucion: "OTRO",
        consulta_maxima: 12,
      });

    if (res.statusCode !== 200) {
      console.error("❌ Error editar horario:", {
        status: res.statusCode,
        body: res.body,
      });
    }

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("horario");
    expect(res.body.horario.hora_inicio).toBe("09:00");
  });
});
