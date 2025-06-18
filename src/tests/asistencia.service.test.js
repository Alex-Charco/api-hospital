const asistenciaService = require('../services/asistencia.service');
const { Asistencia, Cita } = require('../models');

// Mocks
jest.mock('../models', () => ({
  Asistencia: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Cita: {
    findByPk: jest.fn(),
  },
}));

describe('asistencia.service.js', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByCitaId', () => {
    it('debe retornar asistencia si existe', async () => {
      const asistenciaMock = { id: 1, id_cita: 123 };
      Asistencia.findOne.mockResolvedValue(asistenciaMock);

      const result = await asistenciaService.findByCitaId(123);

      expect(Asistencia.findOne).toHaveBeenCalledWith({
        where: { id_cita: 123 },
        include: { model: Cita, as: 'cita' }
      });
      expect(result).toBe(asistenciaMock);
    });

    it('debe retornar null si no existe asistencia', async () => {
      Asistencia.findOne.mockResolvedValue(null);

      const result = await asistenciaService.findByCitaId(456);

      expect(result).toBeNull();
    });
  });

  describe('crearAsistencia', () => {

    it('debe lanzar error si id_cita es inválido', async () => {
      await expect(asistenciaService.crearAsistencia({
        id_cita: -1,
        estado_asistencia: 'CONFIRMADA'
      })).rejects.toThrow('El campo "id_cita" es obligatorio y debe ser un número positivo.');
    });

    it('debe lanzar error si estado_asistencia es inválido', async () => {
      await expect(asistenciaService.crearAsistencia({
        id_cita: 1,
        estado_asistencia: 'INVALIDO'
      })).rejects.toThrow(/El campo "estado_asistencia" es obligatorio/);
    });

    it('debe lanzar error si comentario excede 600 caracteres', async () => {
      const comentarioLargo = 'a'.repeat(601);
      await expect(asistenciaService.crearAsistencia({
        id_cita: 1,
        estado_asistencia: 'CONFIRMADA',
        comentario: comentarioLargo
      })).rejects.toThrow('El campo "comentario" no puede exceder los 600 caracteres.');
    });

    it('debe lanzar error si no existe la cita', async () => {
      Cita.findByPk.mockResolvedValue(null);
      await expect(asistenciaService.crearAsistencia({
        id_cita: 1,
        estado_asistencia: 'CONFIRMADA'
      })).rejects.toThrow('No se encontró la cita con el ID proporcionado.');
    });

    it('debe lanzar error si ya existe asistencia para la cita', async () => {
      Cita.findByPk.mockResolvedValue({ id: 1 });
      Asistencia.findOne.mockResolvedValue({ id: 10 });

      await expect(asistenciaService.crearAsistencia({
        id_cita: 1,
        estado_asistencia: 'CONFIRMADA'
      })).rejects.toThrow('Ya existe una asistencia registrada para esta cita.');
    });

    it('debe crear asistencia correctamente', async () => {
      const nuevaAsistencia = { id: 100, id_cita: 1, estado_asistencia: 'CONFIRMADA' };

      Cita.findByPk.mockResolvedValue({ id: 1 });
      Asistencia.findOne.mockResolvedValue(null);
      Asistencia.create.mockResolvedValue(nuevaAsistencia);

      const result = await asistenciaService.crearAsistencia({
        id_cita: 1,
        estado_asistencia: 'CONFIRMADA',
        comentario: 'Todo ok'
      });

      expect(Asistencia.create).toHaveBeenCalledWith({
        id_cita: 1,
        estado_asistencia: 'CONFIRMADA',
        comentario: 'Todo ok'
      });

      expect(result).toBe(nuevaAsistencia);
    });

  });

});
