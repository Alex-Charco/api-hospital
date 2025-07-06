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
  Diagnostico,
  NotaEvolutiva,
  Paciente,
} = require('../models');

const medicacionService = require("../services/medicacion.service");
const medicamentoService = require("../services/medicamento.service");
const posologiaService = require("../services/posologia.service");
const recetaAutorizacionService = require("../services/receta_autorizacion.service");
const notaEvolutivaService = require("../services/nota_evolutiva.service");
const pacienteService = require("../services/paciente.service");

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
    it("debería crear receta correctamente", async () => {
      NotaEvolutiva.findOne.mockResolvedValue({ id_cita: 1 });
      notaEvolutivaService.obtenerCitaPorId.mockResolvedValue({ id_paciente: 99 });

      const mockReceta = { id_receta: 10, toJSON: () => ({ id_receta: 10 }) };
      Receta.create = jest.fn().mockResolvedValue(mockReceta);

      const mockMedicamento = { id_medicamento: 5 };
      medicamentoService.crearMedicamento.mockResolvedValue(mockMedicamento);

      const mockMedicacion = { id_medicacion: 50 };
      medicacionService.crearMedicacion.mockResolvedValue(mockMedicacion);

      const mockPosologia = { id_posologia: 500 };
      posologiaService.crearPosologia.mockResolvedValue(mockPosologia);

      const mockAutorizacion = { id_receta_autorizacion: 1000 };
      recetaAutorizacionService.crearRecetaAutorizacion.mockResolvedValue(mockAutorizacion);
      pacienteService.obtenerPacientePorId.mockResolvedValue({
        primer_nombre: "Juan",
        segundo_nombre: "Carlos",
        primer_apellido: "Pérez",
        segundo_apellido: "Gómez",
        celular: "0999999999",
        telefono: "022345678",
        correo: "juan@example.com",
        direccion: "Calle Falsa 123"
      });

      const result = await crearReceta({
        id_nota_evolutiva: 1,
        fecha_prescripcion: "2025-07-01",
        medicaciones: [{
          externo: 0,
          indicacion: "Tomar después de las comidas",
          signo_alarma: "Dolor intenso",
          indicacion_no_farmacologica: "Reposo",
          recomendacion_no_farmacologica: "Hidratación",
          medicamento: {
            nombre_medicamento: "Paracetamol",
            cum: "12345",
            forma_farmaceutica: "Tableta",
            via_administracion: "Oral",
            concentracion: "500mg",
            presentacion: "Caja x 10",
            tipo: "AGUDO",
            cantidad: 10
          },
          posologias: [{
            dosis_numero: 1,
            dosis_tipo: "TABLETA",
            frecuencia_numero: 8,
            frecuencia_tipo: "HORAS",
            duracion_numero: 5,
            duracion_tipo: "DÍAS",
            fecha_inicio: "2025-07-01",
            hora_inicio: "08:00:00",
            via: "ORAL"
          }]
        }],
        receta_autorizacion: {
          tipo_autorizado: "PACIENTE",
          id_paciente: 99
        }
      }, {}); // transaction puede ser vacía porque se mockea internamente

      expect(Receta.create).toHaveBeenCalled();
      expect(medicamentoService.crearMedicamento).toHaveBeenCalled();
      expect(medicacionService.crearMedicacion).toHaveBeenCalled();
      expect(posologiaService.crearPosologia).toHaveBeenCalled();
      expect(recetaAutorizacionService.crearRecetaAutorizacion).toHaveBeenCalled();

      expect(result).toHaveProperty("receta");
      expect(result).toHaveProperty("medicacionesGuardadas");
      expect(result).toHaveProperty("posologiasGuardadas");
      expect(result).toHaveProperty("recetaAutorizacion");
    });

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
