const seguroService = require('../services/seguro.service');
const { Seguro } = require('../models');
const errorMessages = require('../utils/error_messages');

jest.mock('../models', () => ({
    Seguro: {
        findOne: jest.fn(),
        create: jest.fn()
    },
    HistorialCambiosSeguro: {
        bulkCreate: jest.fn()
    },
    sequelize: {
        transaction: jest.fn().mockImplementation(cb => cb())
    }
}));


describe('Seguro Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validarSeguroRegistrado', () => {
        it('debe lanzar un error si ya existe un seguro para el paciente', async () => {
            Seguro.findOne.mockResolvedValue({ id_seguro: 1 });

            await expect(seguroService.validarSeguroRegistrado(123))
                .rejects.toThrow(errorMessages.seguroYaRegistrado);
        });

        it('no debe lanzar error si el paciente no tiene un seguro registrado', async () => {
            Seguro.findOne.mockResolvedValue(null);

            await expect(seguroService.validarSeguroRegistrado(123)).resolves.toBeUndefined();
        });
    });

    describe('obtenerSeguro', () => {
        it('debe retornar el seguro si existe', async () => {
            const mockSeguro = { id_seguro: 1 };
            Seguro.findOne.mockResolvedValue(mockSeguro);

            const result = await seguroService.obtenerSeguro(123);
            expect(result).toEqual(mockSeguro);
        });

        it('debe lanzar un error si no se encuentra el seguro', async () => {
            Seguro.findOne.mockResolvedValue(null);

            await expect(seguroService.obtenerSeguro(123))
                .rejects.toThrow(errorMessages.seguroNoEncontrado);
        });
    });

    describe('crearSeguro', () => {
        it('debe crear y retornar un nuevo seguro', async () => {
            const datos = { nombre_seguro: 'Mapfre' };
            const mockResult = { id_seguro: 1, ...datos };
            Seguro.create.mockResolvedValue(mockResult);

            const result = await seguroService.crearSeguro(123, datos);
            expect(Seguro.create).toHaveBeenCalledWith({ id_paciente: 123, ...datos });
            expect(result).toEqual(mockResult);
        });

        it('debe lanzar un error si ocurre un fallo al crear', async () => {
            Seguro.create.mockRejectedValue(new Error('DB error'));

            await expect(seguroService.crearSeguro(123, {}))
                .rejects.toThrowError(new Error(errorMessages.errorCrearSeguro + 'DB error'));

        });
    });

    describe('actualizarSeguro', () => {
    it('debe actualizar y retornar el seguro', async () => {
        const seguroMock = {
            id_seguro: 1,
            get: jest.fn().mockReturnValue({ tipo: 'A', beneficiario: 'Juan' }),
            update: jest.fn().mockResolvedValue({ nombre_seguro: 'Actualizado' })
        };

        const result = await seguroService.actualizarSeguro(
            seguroMock,
            { nombre_seguro: 'Actualizado' },
            999 // <-- id_usuario
        );

        expect(seguroMock.update).toHaveBeenCalledWith({ nombre_seguro: 'Actualizado' }, expect.anything());
        expect(result).toEqual({ nombre_seguro: 'Actualizado' });
    });

    it('debe lanzar un error si ocurre un fallo al actualizar', async () => {
        const seguroMock = {
            id_seguro: 1,
            get: jest.fn().mockReturnValue({}),
            update: jest.fn().mockRejectedValue(new Error('Update failed'))
        };

        await expect(seguroService.actualizarSeguro(seguroMock, {}, 999))
            .rejects.toThrow('Error al actualizar el seguro: Update failed');
    });
});

});
