// receta.service.test.js

const {
  crearReceta,
  obtenerNotaEvolutivaPorId,
  obtenerRecetasDetalladas,
  obtenerDiagnosticosPorNota,
  obtenerPacienteYFamiliarPorId,
  obtenerRecetaPorCita,
} = require('../services/receta.service');

const {
  Receta,
  Medicacion,
  Medicamento,
  Posologia,
  Diagnostico,
  RecetaAutorizacion,
  NotaEvolutiva,
  Paciente,
  Familiar,
  PersonaExterna,
  Cita,
  Turno,
  Horario,
  Medico,
  Especialidad,
  sequelize
} = require('../models');

const medicacionService = require("../services/medicacion.service");
const medicamentoService = require("../services/medicamento.service");
const posologiaService = require("../services/posologia.service");
const recetaAutorizacionService = require("../services/receta_autorizacion.service");
const notaEvolutivaService = require("../services/nota_evolutiva.service");
const pacienteService = require("../services/paciente.service");
const familiarService = require("../services/familiar.service");
const personaExternaService = require("../services/persona_externa.service");
const { formatFecha } = require('../utils/date_utils');
const { getEdad } = require('../utils/edad_utils');

jest.mock('../models', () => ({
  Receta: { count: jest.fn(), findAll: jest.fn() },
  Medicacion: {},
  Medicamento: {},
  Posologia: {},
  Diagnostico: { findAll: jest.fn() },
  RecetaAutorizacion: {},
  NotaEvolutiva: { findOne: jest.fn() },
  Paciente: { findOne: jest.fn() },
  Familiar: {},
  PersonaExterna: {},
  Cita: {},
  Turno: {},
  Horario: {},
  Medico: {},
  Especialidad: {},
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    transaction: jest.fn().mockImplementation(async (fn) => {
      const t = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };
      return await fn(t);
    }),
  }
}));

jest.mock("../services/medicamento.service");
jest.mock("../services/medicacion.service");
jest.mock("../services/posologia.service");
jest.mock("../services/receta_autorizacion.service");
jest.mock("../services/nota_evolutiva.service");
jest.mock("../services/paciente.service");
jest.mock("../services/familiar.service");
jest.mock("../services/persona_externa.service");

jest.mock("../utils/date_utils", () => ({
  formatFecha: jest.fn((date) => date)
}));

jest.mock("../utils/edad_utils", () => ({
  getEdad: jest.fn(() => 30)
}));

describe("receta.service.js", () => {
  afterEach(() => jest.clearAllMocks());

  describe("obtenerNotaEvolutivaPorId", () => {
    it("debería retornar una nota evolutiva si existe", async () => {
      const mockNota = { id_nota_evolutiva: 1 };
      NotaEvolutiva.findOne.mockResolvedValue(mockNota);
      const result = await obtenerNotaEvolutivaPorId(1);
      expect(result).toEqual(mockNota);
      expect(NotaEvolutiva.findOne).toHaveBeenCalledWith({ where: { id_nota_evolutiva: 1 } });
    });
  });

  describe("obtenerDiagnosticosPorNota", () => {
    it("debería retornar los diagnósticos por nota", async () => {
      const mockDiagnosticos = [{ id_diagnostico: 1 }];
      Diagnostico.findAll.mockResolvedValue(mockDiagnosticos);
      const result = await obtenerDiagnosticosPorNota(1);
      expect(result).toEqual(mockDiagnosticos);
      expect(Diagnostico.findAll).toHaveBeenCalledWith({ where: { id_nota_evolutiva: 1 } });
    });
  });

  describe("obtenerPacienteYFamiliarPorId", () => {
    it("debería retornar null si no hay paciente", async () => {
      Paciente.findOne.mockResolvedValue(null);
      const result = await obtenerPacienteYFamiliarPorId(999);
      expect(result).toEqual({ paciente: null, familiar: null });
    });
  });

  describe("obtenerRecetaPorCita", () => {
    it("debería lanzar error si no hay id_cita", async () => {
      await expect(obtenerRecetaPorCita()).rejects.toThrow("id_cita requerido");
    });

    it("debería lanzar error si no se encuentra nota", async () => {
      NotaEvolutiva.findOne.mockResolvedValue(null);
      await expect(obtenerRecetaPorCita(1)).rejects.toThrow("No se encontró nota evolutiva para la cita");
    });
  });

  describe("obtenerRecetasDetalladas", () => {
    it("debería retornar lista de recetas detalladas paginadas", async () => {
      Receta.count.mockResolvedValue(1);
      Receta.findAll.mockResolvedValue([
        {
          id_receta: 1,
          id_nota_evolutiva: 1,
          fecha_prescripcion: "2025-07-01",
          fecha_vigencia: "2025-07-03",
          medicaciones: [],
          receta_autorizacion: null
        }
      ]);
      const result = await obtenerRecetasDetalladas({ page: 1, limit: 5 });
      expect(result.total).toBe(1);
      expect(result.pages).toBe(1);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("crearReceta", () => {
    it("debería lanzar error si nota evolutiva no existe", async () => {
      NotaEvolutiva.findOne.mockResolvedValue(null);
      await expect(crearReceta({ id_nota_evolutiva: 123, fecha_prescripcion: "2025-07-01" }, {}))
        .rejects.toThrow("Error al crear la receta: Nota evolutiva no encontrada");
    });

    it("debería lanzar error si cita no existe", async () => {
      NotaEvolutiva.findOne.mockResolvedValue({ id_cita: 1 });
      notaEvolutivaService.obtenerCitaPorId.mockResolvedValue(null);
      await expect(crearReceta({ id_nota_evolutiva: 1, fecha_prescripcion: "2025-07-01" }, {}))
        .rejects.toThrow("Error al crear la receta: Cita no encontrada");
    });

    it("debería lanzar error si falta id_paciente", async () => {
      NotaEvolutiva.findOne.mockResolvedValue({ id_cita: 1 });
      notaEvolutivaService.obtenerCitaPorId.mockResolvedValue({});
      await expect(crearReceta({ id_nota_evolutiva: 1, fecha_prescripcion: "2025-07-01" }, {}))
        .rejects.toThrow("Error al crear la receta: Paciente no encontrado.");
    });
  });
});
