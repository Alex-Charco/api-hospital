const horarioService = require('../services/horario.service');
const { Horario, Medico, Turno, Especialidad, sequelize } = require('../models');
const errorMessages = require("../utils/error_messages");

// Mock de Sequelize y modelos
jest.mock('../models', () => {
  const mSequelize = {
    query: jest.fn(),
    QueryTypes: { SELECT: 'SELECT' }
  };

  return {
    sequelize: mSequelize,
    Horario: {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn()
    },
    Medico: {
      findOne: jest.fn()
    },
    Turno: {},
    Especialidad: {}
  };
});


describe('horarioService', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validarHorarioRegistrado', () => {
    it('debería lanzar error si el médico ya tiene un horario', async () => {
      Horario.findOne.mockResolvedValue({ id_medico: 1 });

      await expect(horarioService.validarHorarioRegistrado(1))
        .rejects
        .toThrow(errorMessages.horarioYaRegistrado);
    });

    it('no debería lanzar error si el médico no tiene horario', async () => {
      Horario.findOne.mockResolvedValue(null);

      await expect(horarioService.validarHorarioRegistrado(1)).resolves.toBeUndefined();
    });
  });

  describe('validarHorarioNuevo', () => {
    it('debería lanzar error si los parámetros faltan', async () => {
      await expect(horarioService.validarHorarioNuevo(null, null, null, null))
        .rejects.toThrow("Faltan parámetros para validar el horario.");
    });

    it('debería lanzar error si hay un horario solapado', async () => {
      sequelize.query.mockResolvedValue([{ id_horario: 1 }]);

      await expect(horarioService.validarHorarioNuevo(1, '2024-01-01', '08:00', '09:00'))
        .rejects.toThrow("El horario se solapa con otro turno ya registrado");
    });

    it('debería pasar si no hay solapamiento', async () => {
      sequelize.query.mockResolvedValue([]);

      await expect(horarioService.validarHorarioNuevo(1, '2024-01-01', '08:00', '09:00'))
        .resolves.toBe(true);
    });
  });

  describe('obtenerHorario', () => {
    it('debería devolver médico undefined y horarios vacío si no hay horarios', async () => {
	  Horario.findAll.mockResolvedValue([]);
	  Medico.findOne.mockResolvedValue(undefined); // importante

	  const result = await horarioService.obtenerHorario(1);
	  expect(result).toEqual({ medico: undefined, horarios: [] });
	});

    it('debería lanzar error si no encuentra al médico', async () => {
      Horario.findAll.mockResolvedValue([{ id: 1 }]);
      Medico.findOne.mockResolvedValue(null);

      await expect(horarioService.obtenerHorario(1)).rejects.toThrow("Médico no encontrado.");
    });

    it('debería devolver horarios y médico correctamente', async () => {
      const horariosMock = [{ id: 1 }];
      const medicoMock = { id_medico: 1 };

      Horario.findAll.mockResolvedValue(horariosMock);
      Medico.findOne.mockResolvedValue(medicoMock);

      const result = await horarioService.obtenerHorario(1);
      expect(result).toEqual({ medico: medicoMock, horarios: horariosMock });
    });
  });

  describe('crearHorario', () => {
    it('debería crear y retornar un nuevo horario', async () => {
      const nuevoHorario = { id: 1, fecha_horario: '2024-01-01' };
      Horario.create.mockResolvedValue(nuevoHorario);

      const result = await horarioService.crearHorario(1, { fecha_horario: '2024-01-01' });
      expect(result).toEqual(nuevoHorario);
    });

    it('debería lanzar error si falla al crear horario', async () => {
      Horario.create.mockRejectedValue(new Error('DB error'));

      await expect(horarioService.crearHorario(1, {}))
        .rejects.toThrow(errorMessages.errorCrearHorario + "DB error");
    });
  });

  describe('editarHorario', () => {
    it('debería lanzar error si el horario no existe', async () => {
      Horario.findOne.mockResolvedValue(null);

      await expect(horarioService.editarHorario(99, {})).rejects.toThrow(errorMessages.horarioNoEncontrado);
    });

    it('debería editar y retornar el horario actualizado', async () => {
      const mockHorario = {
        update: jest.fn().mockResolvedValue({ id: 1, hora_inicio: '09:00' })
      };

      Horario.findOne.mockResolvedValue(mockHorario);

      const result = await horarioService.editarHorario(1, { hora_inicio: '09:00' });
      expect(result).toEqual({ id: 1, hora_inicio: '09:00' });
    });
  });
});
