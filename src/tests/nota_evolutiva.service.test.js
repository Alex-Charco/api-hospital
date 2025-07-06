const notaService = require('../services/nota_evolutiva.service');
const {
  NotaEvolutiva,
  Cita,
  Paciente,
  SignoVital
} = require('../models');
const diagnosticoService = require('../services/diagnostico.service');
const procedimientoService = require('../services/procedimiento.service');
const linkService = require('../services/link.service');

beforeAll(() => {
    // Silenciar console.log y console.error en todo este describe
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

jest.mock('../models', () => {

  return {
    Cita: {
      findOne: jest.fn(),
    },
    Paciente: {
      findOne: jest.fn(),
    },
    NotaEvolutiva: {
      create: jest.fn(),
      count: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
    },
    Diagnostico: {},
    Procedimiento: {},
    Link: {},
    SignoVital: {
      create: jest.fn(),
    },
    sequelize: {
      transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn(),
      }),
    },
  };
});


jest.mock('../services/diagnostico.service');
jest.mock('../services/procedimiento.service');
jest.mock('../services/link.service');

describe('nota_evolutiva.service', () => {
  const mockTransaction = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- crearNota ----------
  describe('crearNota', () => {
    it('✅ debe crear una nota evolutiva correctamente', async () => {
      const data = {
        id_cita: 1,
        motivo_consulta: 'Dolor abdominal',
        diagnosticos: [{
          condicion: 'Definitivo',
          tipo: 'Primera',
          cie_10: 'K021',
          descripcion: 'Caries',
          procedimientos: [{ codigo: '001', descripcion_proc: 'Limpieza' }]
        }],
        links: [{
          categoria: 'Radiografía',
          nombre_documento: 'rayos.pdf',
          url: 'http://test.com'
        }],
        signo_vital: {
          presion: '120/80',
          temperatura: 36.5
        }
      };

      Cita.findOne.mockResolvedValue({ id_cita: 1, id_paciente: 2 });


      NotaEvolutiva.create.mockResolvedValue({
        id_nota_evolutiva: 10,
        toJSON: () => ({ id_nota_evolutiva: 10 })
      });
      SignoVital.create.mockResolvedValue({});
      diagnosticoService.crearDiagnostico.mockResolvedValue({ id_diagnostico: 20 });
      procedimientoService.crearProcedimiento.mockResolvedValue({});
      linkService.crearLink.mockResolvedValue({});

      const result = await notaService.crearNota(data, mockTransaction);
      console.log('Resultado de crearNota:', result);
      expect(result).toHaveProperty('nota');
      expect(result.nota).toEqual(expect.objectContaining({ id_nota_evolutiva: 10 }));

      expect(result.nota).toHaveProperty('id_nota_evolutiva', 10);

    });

    it('❌ debe lanzar error si la cita no existe', async () => {
      Cita.findOne.mockResolvedValue(null);

      await expect(notaService.crearNota({ id_cita: 999 }, mockTransaction))
        .rejects
        .toThrow('Cita no encontrada');
    });

    it('❌ debe lanzar error si la cita no tiene paciente', async () => {
      Cita.findOne.mockResolvedValue({ id_cita: 1, id_paciente: null });

      await expect(notaService.crearNota({ id_cita: 1 }, mockTransaction))
        .rejects
        .toThrow('Paciente no encontrado');
    });
  });

  // ---------- obtenerNotasDetalladas ----------
  describe('obtenerNotasDetalladas', () => {
    it('✅ debe retornar notas por id_cita', async () => {
      NotaEvolutiva.count.mockResolvedValue(1);
      NotaEvolutiva.findAll.mockResolvedValue([{
        toJSON: () => ({
          id_nota_evolutiva: 1,
          fecha_creacion: new Date(),
          cita: { fecha_creacion: new Date() }
        })
      }]);

      const result = await notaService.obtenerNotasDetalladas({ id_cita: 1 });
      expect(result.data.length).toBe(1);
      expect(result.total).toBe(1);
    });

    it('✅ debe retornar notas por identificación del paciente', async () => {
      Paciente.findOne.mockResolvedValue({ id_paciente: 2 });
      NotaEvolutiva.count.mockResolvedValue(1);
      NotaEvolutiva.findAll.mockResolvedValue([{
        toJSON: () => ({
          id_nota_evolutiva: 2,
          fecha_creacion: new Date(),
          cita: { fecha_creacion: new Date() }
        })
      }]);

      const result = await notaService.obtenerNotasDetalladas({ identificacion: '1234567890' });
      expect(result.data[0].id_nota_evolutiva).toBe(2);
    });

    it('❌ debe lanzar error si el paciente no existe', async () => {
      Paciente.findOne.mockResolvedValue(null);

      await expect(notaService.obtenerNotasDetalladas({ identificacion: '999' }))
        .rejects.toThrow('Paciente no encontrado');
    });
  });

  // ---------- obtenerNotaDetalladaPorId ----------
  describe('obtenerNotaDetalladaPorId', () => {
    it('✅ debe retornar una nota detallada por ID', async () => {
      NotaEvolutiva.findByPk.mockResolvedValue({
        toJSON: () => ({
          id_nota_evolutiva: 10,
          fecha_creacion: new Date(),
          cita: { fecha_creacion: new Date() }
        })
      });

      const result = await notaService.obtenerNotaDetalladaPorId(10);
      expect(result.id_nota_evolutiva).toBe(10);
    });

    it('❌ debe retornar null si no encuentra la nota', async () => {
      NotaEvolutiva.findByPk.mockResolvedValue(null);

      const result = await notaService.obtenerNotaDetalladaPorId(999);
      expect(result).toBeNull();
    });
  });

  // ---------- obtenerCitaPorId ----------
  describe('obtenerCitaPorId', () => {
    it('✅ debe retornar una cita', async () => {
      Cita.findOne.mockResolvedValue({ id_cita: 1 });

      const result = await notaService.obtenerCitaPorId(1);
      expect(result.id_cita).toBe(1);
    });

    it('❌ debe lanzar error si hay problema en la base de datos', async () => {
      Cita.findOne.mockRejectedValue(new Error('DB error'));

      await expect(notaService.obtenerCitaPorId(1)).rejects.toThrow('Error al obtener las citas. DB error');
    });
  });

});
