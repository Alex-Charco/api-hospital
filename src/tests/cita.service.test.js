const {
  obtenerCitas,
  obtenerCitasDelDiaActual,
  obtenerCitasDesdeHoy,
  obtenerCitasPorRango,
  getEdad,
  getGrupoEtario,
  crearCita
} = require('../services/cita.service');

const { Cita, Turno, sequelize } = require('../models');
const { enviarCorreoConfirmacion } = require('../services/email.service');
const { Op } = require('sequelize');

sequelize.transaction.mockImplementation(async (callback) => {
  return await callback(transactionMock);
});

jest.mock('../models', () => ({
  Cita: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Turno: {
    findOne: jest.fn(),
    update: jest.fn(),
  },
  Horario: {},
  Medico: {},
  Especialidad: {},
  Paciente: {},
  sequelize: {
    transaction: jest.fn()
  }
}));

jest.mock('../services/email.service', () => ({
  enviarCorreoConfirmacion: jest.fn()
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Servicio de citas', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Tests para obtenerCitas ---

  describe('obtenerCitas', () => {
    test('retorna array vacío si no hay citas', async () => {
      Cita.findAll.mockResolvedValue([]);
      const result = await obtenerCitas({});
      expect(result).toEqual([]);
      expect(Cita.findAll).toHaveBeenCalled();
    });

    test('retorna citas si las hay', async () => {
      const citasMock = [{ id_cita: 1 }, { id_cita: 2 }];
      Cita.findAll.mockResolvedValue(citasMock);
      const result = await obtenerCitas({});
      expect(result).toEqual(citasMock);
    });

    test('lanza error si falla la consulta', async () => {
      Cita.findAll.mockRejectedValue(new Error('error DB'));
      await expect(obtenerCitas({})).rejects.toThrow('Error al obtener citas: error DB');
    });
  });

  // --- Tests para getEdad ---

  describe('getEdad', () => {
    test('calcula edad correcta', () => {
      const hoy = new Date();
      const anioActual = hoy.getFullYear();
      const fechaNacimiento = `${anioActual - 25}-06-18`;
      expect(getEdad(fechaNacimiento)).toBe(25);
    });

  });

  // --- Tests para getGrupoEtario ---

  describe('getGrupoEtario', () => {
    test.each([
      [5, 'Niño/a'],
      [15, 'Adolescente'],
      [25, 'Joven'],
      [40, 'Adulto'],
      [70, 'Adulto mayor'],
      [-1, 'Edad inválida'],
    ])('para edad %i retorna %s', (edad, esperado) => {
      expect(getGrupoEtario(edad)).toBe(esperado);
    });
  });

  // --- Tests para crearCita ---

  describe('crearCita', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('crea una cita exitosamente', async () => {
    // Preparamos mocks para Turno
    Turno.findOne.mockResolvedValue({
      id_turno: 1,
      estado: 'DISPONIBLE',
      hora_turno: '10:00',
      horario: {
        fecha_horario: '2025-06-18',
        medico: {
          id_medico: 1,
          especialidad: { id_especialidad: 1 }
        }
      }
    });

    // No hay citas duplicadas
    Cita.findAll.mockResolvedValue([]);

    // Mock de update de turno
    Turno.update.mockResolvedValue([1]);

    // Mock de crear cita
    Cita.create.mockResolvedValue({ id_cita: 123 });

    // Mock de buscar cita completa
    Cita.findOne.mockResolvedValue({
      id_cita: 123,
      paciente: {},
      turno: {}
    });

    // Mock de enviar correo
    enviarCorreoConfirmacion.mockResolvedValue();

    // Llamamos al servicio
    const resultado = await crearCita(1, 1);

    expect(resultado).toEqual({ cita: { id_cita: 123, paciente: {}, turno: {} } });
  });

    test('lanza error si turno no disponible', async () => {
      Turno.findOne.mockResolvedValue({ estado: 'OCUPADO' });
      await expect(crearCita(1, 1)).rejects.toThrow();
    });

    test('lanza error si paciente ya tiene 2 citas en el día', async () => {
      Turno.findOne.mockResolvedValue({
        id_turno: 1,
        estado: 'DISPONIBLE',
        hora_turno: '10:00',
        horario: {
          fecha_horario: '2025-06-18',
          medico: {
            id_medico: 1,
            especialidad: { id_especialidad: 1 }
          }
        }
      });

      Cita.findAll.mockResolvedValue([{}, {}, {}]); // 3 citas

      await expect(crearCita(1, 1)).rejects.toThrow("El paciente ya tiene 2 citas registradas para ese día.");
    });

    test('lanza error si existe cita duplicada para la misma hora, médico y especialidad', async () => {
      const turnoMock = {
        id_turno: 1,
        estado: 'DISPONIBLE',
        hora_turno: '10:00',
        horario: {
          fecha_horario: '2025-06-18',
          medico: {
            id_medico: 1,
            especialidad: { id_especialidad: 1 }
          }
        }
      };

      Turno.findOne.mockResolvedValue(turnoMock);

      // Cita del día que coincide en hora, médico y especialidad
      Cita.findAll.mockResolvedValue([
        {
          turno: {
            hora_turno: '10:00',
            horario: {
              medico: {
                id_medico: 1,
                especialidad: { id_especialidad: 1 }
              }
            }
          }
        }
      ]);

      await expect(crearCita(1, 1)).rejects.toThrow();
    });
  });

});
