jest.mock('../models', () => ({
  Residencia: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  HistorialCambiosResidencia: {
    bulkCreate: jest.fn(),
  },
  sequelize: {
	  transaction: jest.fn(async (cb) => await cb({})), // 👈 async y await
	},
}));

const residenciaService = require('../services/residencia.service');
const { Residencia } = require('../models');
const errorMessages = require("../utils/error_messages");

jest.mock('../config/db', () => ({
  transaction: jest.fn((callback) => callback({}))
}));

jest.spyOn(console, 'log').mockImplementation(() => {});
	
describe('validarResidenciaRegistrada', () => {
    it('debe lanzar un error si ya existe una residencia', async () => {
        Residencia.findOne.mockResolvedValue({ id_residencia: 1 });

        await expect(residenciaService.validarResidenciaRegistrada(123))
            .rejects
            .toThrow(errorMessages.residenciaYaRegistrada);
    });

    it('no lanza error si no existe residencia', async () => {
        Residencia.findOne.mockResolvedValue(null);

        await expect(residenciaService.validarResidenciaRegistrada(123))
            .resolves
            .toBeUndefined();
    });
});

describe('obtenerResidencia', () => {
    it('debe retornar la residencia si existe', async () => {
        const mockResidencia = { id_residencia: 1, direccion: 'Calle Falsa' };
        Residencia.findOne.mockResolvedValue(mockResidencia);

        const result = await residenciaService.obtenerResidencia(123);
        expect(result).toEqual(mockResidencia);
    });

    it('debe lanzar un error si no se encuentra residencia', async () => {
        Residencia.findOne.mockResolvedValue(null);

        await expect(residenciaService.obtenerResidencia(123))
            .rejects
            .toThrow(errorMessages.residenciaNoEncontrada);
    });
});

describe('crearResidencia', () => {
    it('debe crear una residencia y devolverla', async () => {
        const mockData = { direccion: 'Av Siempre Viva' };
        const mockResult = { id_residencia: 1, ...mockData };

        Residencia.create.mockResolvedValue(mockResult);

        const result = await residenciaService.crearResidencia(1, mockData);
        expect(result).toEqual(mockResult);
        expect(Residencia.create).toHaveBeenCalledWith({ id_paciente: 1, ...mockData });
    });

    it('debe lanzar un error si ocurre un fallo al crear', async () => {
        Residencia.create.mockRejectedValue(new Error('DB error'));

        await expect(residenciaService.crearResidencia(1, {}))
            .rejects
            .toThrow(new Error(errorMessages.errorCrearResidencia + "DB error"));

    });
});

describe('actualizarResidencia', () => {
    it('debe actualizar y devolver la residencia', async () => {
    const mockResidencia = {
      get: jest.fn().mockReturnValue({ direccion: 'Antigua dirección' }),
      id_residencia: 1,
      update: jest.fn().mockResolvedValue({ id_residencia: 1, direccion: 'Nueva dirección' })
    };

    const result = await residenciaService.actualizarResidencia(
      mockResidencia,
      { direccion: 'Nueva dirección' },
      123 // id_usuario
    );

    expect(mockResidencia.update).toHaveBeenCalledWith(
      { direccion: 'Nueva dirección' },
      expect.any(Object)
    );
    expect(result).toEqual({ id_residencia: 1, direccion: 'Nueva dirección' });
  });

	it('debe lanzar un error si ocurre un fallo al actualizar', async () => {
    const mockResidencia = {
      id_residencia: 1,
      lugar_nacimiento: "Quito",
      pais: "Ecuador",
      nacionalidad: "Ecuatoriana",
      provincia: "Pichincha",
      canton: "Quito",
      parroquia: "Centro",
      direccion: "Av. Siempre Viva 123",
      get: jest.fn().mockReturnValue({
        lugar_nacimiento: "Quito",
        pais: "Ecuador",
        nacionalidad: "Ecuatoriana",
        provincia: "Pichincha",
        canton: "Quito",
        parroquia: "Centro",
        direccion: "Av. Siempre Viva 123",
      }),

      update: jest.fn().mockRejectedValue(new Error("Update failed")),
    };

    await expect(residenciaService.actualizarResidencia(mockResidencia, {}, 123))
      .rejects
      .toThrow(new Error("No se pudo actualizar la residencia. Update failed"));
  });
});