const { 
  validarUsuarioParaMedico,
  validarIdentificacionMedico,
  crearMedico,
  obtenerMedicos,
  actualizarDatosMedico,
  validarMedicoExistente,
  obtenerMedicoPorIdentificacion
} = require("../services/medico.service");

const { Medico, Usuario, Especialidad } = require("../models");
const { verificarUsuarioExistente } = require("../services/user.service");
const errorMessages = require("../utils/error_messages");

// 🔧 Mocks
jest.mock("../models", () => ({
  Medico: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn()
  },
  Usuario: {},
  Especialidad: {}
}));

jest.mock("../services/user.service", () => ({
  verificarUsuarioExistente: jest.fn()
}));

describe("medico.service.js", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validarUsuarioParaMedico", () => {
    it("debe lanzar error si el usuario no existe", async () => {
      verificarUsuarioExistente.mockResolvedValue(null);
      await expect(validarUsuarioParaMedico("juan"))
        .rejects.toThrow(errorMessages.usuarioNoExistente);
    });

    it("debe lanzar error si el usuario no es médico", async () => {
      verificarUsuarioExistente.mockResolvedValue({ id_usuario: 1, id_rol: 1 });
      await expect(validarUsuarioParaMedico("juan"))
        .rejects.toThrow(errorMessages.usuarioNoEsMedico);
    });

    it("debe lanzar error si el usuario ya está registrado como médico", async () => {
      verificarUsuarioExistente.mockResolvedValue({ id_usuario: 1, id_rol: 2 });
      Medico.findOne.mockResolvedValue({ id_medico: 99 });
      await expect(validarUsuarioParaMedico("juan"))
        .rejects.toThrow(errorMessages.usuarioRegistradoMedico);
    });

    it("debe retornar el usuario si es válido", async () => {
      const user = { id_usuario: 2, id_rol: 2 };
      verificarUsuarioExistente.mockResolvedValue(user);
      Medico.findOne.mockResolvedValue(null);

      const result = await validarUsuarioParaMedico("juan");
      expect(result).toEqual(user);
    });
  });

  describe("validarIdentificacionMedico", () => {
    it("debe lanzar error si ya existe un médico con esa identificación", async () => {
      Medico.findOne.mockResolvedValue({ id_medico: 1 });
      await expect(validarIdentificacionMedico("12345"))
        .rejects.toThrow(errorMessages.medicoYaRegistrado);
    });

    it("no debe lanzar error si la identificación es única", async () => {
      Medico.findOne.mockResolvedValue(null);
      await expect(validarIdentificacionMedico("67890")).resolves.toBeUndefined();
    });
  });

  describe("crearMedico", () => {
    it("debe crear y devolver el médico", async () => {
      const medicoMock = { id_medico: 1, nombre: "Dr. Juan" };
      Medico.create.mockResolvedValue(medicoMock);

      const result = await crearMedico(medicoMock);
      expect(result).toEqual(medicoMock);
    });
  });

  describe("obtenerMedicos", () => {
    it("debe retornar todos los médicos si no se pasa identificación", async () => {
      const mockMedicos = [{ id_medico: 1 }, { id_medico: 2 }];
      Medico.findAll.mockResolvedValue(mockMedicos);

      const result = await obtenerMedicos();
      expect(result).toEqual(mockMedicos);
      expect(Medico.findAll).toHaveBeenCalledWith({
        include: expect.any(Array)
      });
    });

    it("debe buscar médicos por identificación", async () => {
      const mockMedico = [{ id_medico: 1 }];
      Medico.findAll.mockResolvedValue(mockMedico);

      const result = await obtenerMedicos("ABC123");
      expect(Medico.findAll).toHaveBeenCalledWith({
        where: { identificacion: "ABC123" },
        include: expect.any(Array)
      });
      expect(result).toEqual(mockMedico);
    });
  });

  describe("actualizarDatosMedico", () => {
    it("debe actualizar y devolver el médico", async () => {
      const medico = { update: jest.fn().mockResolvedValue({ id_medico: 1, nombre: "Nuevo Nombre" }) };
      const result = await actualizarDatosMedico(medico, { nombre: "Nuevo Nombre" });
      expect(result).toEqual({ id_medico: 1, nombre: "Nuevo Nombre" });
    });
  });

  describe("validarMedicoExistente", () => {
    it("debe retornar el médico si existe", async () => {
      const medicoMock = { id_medico: 1 };
      Medico.findOne.mockResolvedValue(medicoMock);

      const result = await validarMedicoExistente("ABC123");
      expect(result).toEqual(medicoMock);
    });

    it("debe retornar null si no existe", async () => {
      Medico.findOne.mockResolvedValue(null);
      const result = await validarMedicoExistente("XYZ987");
      expect(result).toBeNull();
    });
  });

  describe("obtenerMedicoPorIdentificacion", () => {
    it("debe retornar el médico con la identificación", async () => {
      const mockMedico = { id_medico: 1, nombre: "Dr. Pedro" };
      Medico.findOne.mockResolvedValue(mockMedico);

      const result = await obtenerMedicoPorIdentificacion("ABC123");
      expect(result).toEqual(mockMedico);
    });
  });
});
