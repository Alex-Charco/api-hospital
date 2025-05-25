const residenciaService = require('../services/residencia.service');
const { Residencia } = require('../models');
const errorMessages = require("../utils/error_messages");

// Mock del modelo
jest.mock('../models', () => {
    return {
        Residencia: {
            findOne: jest.fn(),
            create: jest.fn(),
        }
    };
});

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
            update: jest.fn().mockResolvedValue({ id_residencia: 1, direccion: 'Nueva dirección' })
        };

        const result = await residenciaService.actualizarResidencia(mockResidencia, { direccion: 'Nueva dirección' });
        expect(result).toEqual({ id_residencia: 1, direccion: 'Nueva dirección' });
    });

    it('debe lanzar un error si ocurre un fallo al actualizar', async () => {
        const mockResidencia = {
            update: jest.fn().mockRejectedValue(new Error('Update failed'))
        };

        await expect(residenciaService.actualizarResidencia(mockResidencia, {}))
            .rejects
            .toThrow(new Error(errorMessages.errorActualizarResidencia + "Update failed"));

    });
});
