const request = require("supertest");
const app = require("../../app");
const { Usuario, Especialidad, Medico, HistorialCambiosMedico } = require("../../models");

const tokenTest = "Bearer TU_TOKEN_VALIDO_AQUI"; // Reemplázalo por uno válido

describe("🩺 Pruebas de integración - Médico", () => {
  let usuario, especialidad, medico;
  const identificacion = `MED${Date.now().toString().slice(-6)}`;

  beforeAll(async () => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    especialidad = await Especialidad.create({
      nombre: "MEDICINA GENERAL",
      atencion: "CONSULTA EXTERNA",
      consultorio: "CONSULTORIO 1 MEDICINA GENERAL"
    });

    usuario = await Usuario.create({
      nombre_usuario: `medico_test_${Date.now()}`,
      password: "Password-123",
      id_rol: 2,
      estatus: 1,
    });
  });

  afterAll(async () => {
    await HistorialCambiosMedico.destroy({ where: {} });
    if (medico) await Medico.destroy({ where: { id_medico: medico.id_medico } });
    await Usuario.destroy({ where: { id_usuario: usuario.id_usuario } });
    await Especialidad.destroy({ where: { id_especialidad: especialidad.id_especialidad } });
    jest.restoreAllMocks();
  });

  test("POST /api/medico/registrar debe registrar un médico", async () => {
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
        reg_msp: "REG12345"
      });

    if (res.statusCode !== 201) {
      console.error("❌ Registro médico falló:", res.body.message);
    }

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("medico");
    medico = res.body.medico;
  });

  test("GET /api/medico/get/:identificacion debe obtener datos del médico", async () => {
    const res = await request(app)
      .get(`/api/medico/get/${identificacion}`)
      .set("Authorization", tokenTest);

    if (res.statusCode !== 200) {
      console.error("❌ Error al obtener médico:", res.body.message);
    }

    expect(res.statusCode).toBe(200);
    expect(res.body.medicos.identificacion).toBe(identificacion);
  });

  test("PUT /api/medico/put/:identificacion debe actualizar datos del médico", async () => {
    const res = await request(app)
      .put(`/api/medico/put/${identificacion}`)
      .set("Authorization", tokenTest)
      .send({
        id_usuario_modificador: usuario.id_usuario,
        celular: "0988887777"
      });

    if (res.statusCode !== 200) {
      console.error("❌ Error al actualizar médico:", res.body.message);
    }

    expect(res.statusCode).toBe(200);
    expect(res.body.medico.celular).toBe("0988887777");
  });

  test("GET /api/medico/get/historial/:identificacion debe obtener historial de cambios", async () => {
    const res = await request(app)
      .get(`/api/medico/get/historial/${identificacion}`)
      .set("Authorization", tokenTest);

    if (![200, 404].includes(res.statusCode)) {
      console.error("❌ Error en historial:", res.body.message);
    }

    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});
