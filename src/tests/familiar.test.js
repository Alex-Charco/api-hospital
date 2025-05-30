const familiarService = require('../services/familiar.service');
const { Familiar, HistorialCambiosFamiliar } = require('../models');
const errorMessages = require('../utils/error_messages');

// Mock de Sequelize
jest.mock('../models', () => ({
    Familiar: {
        findOne: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
    },
    HistorialCambiosFamiliar: {
        bulkCreate: jest.fn(),
    },
}));

describe('Familiar Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validarFamiliarRegistrado', () => {
        it('debe lanzar un error si el familiar ya existe', async () => {
            Familiar.findOne.mockResolvedValue({ id: 1 });

            await expect(familiarService.validarFamiliarRegistrado(1, 'padre'))
                .rejects.toThrow(errorMessages.familiarRegistrado);
        });

        it('no debe lanzar error si el familiar no existe', async () => {
            Familiar.findOne.mockResolvedValue(null);

            await expect(familiarService.validarFamiliarRegistrado(1, 'madre'))
                .resolves.toBeUndefined();
        });
    });

    describe('obtenerFamiliarCondicional', () => {
        it('debe retornar un familiar si se encuentra por id_paciente', async () => {
            const mockFamiliar = { id: 1, nombre: 'Juan' };
            Familiar.findOne.mockResolvedValue(mockFamiliar);

            const result = await familiarService.obtenerFamiliarCondicional({ id_paciente: 1 });

            expect(result).toEqual(mockFamiliar);
        });

        it('debe lanzar un error si no se encuentra el familiar', async () => {
            Familiar.findOne.mockResolvedValue(null);

            await expect(
                familiarService.obtenerFamiliarCondicional({ id_paciente: 999 })
            ).rejects.toThrow(errorMessages.familiarNoEncontrado);
        });
    });

    describe('obtenerFamiliarPorIdentificacion', () => {
        it('debe retornar el familiar si existe por identificación', async () => {
            const mockFamiliar = { id: 1, identificacion: '123' };
            Familiar.findOne.mockResolvedValue(mockFamiliar);

            const result = await familiarService.obtenerFamiliarPorIdentificacion('123');

            expect(result).toEqual(mockFamiliar);
        });

        it('debe lanzar error si no se encuentra', async () => {
            Familiar.findOne.mockResolvedValue(null);

            await expect(
                familiarService.obtenerFamiliarPorIdentificacion('999')
            ).rejects.toThrow(errorMessages.familiarNoEncontrado);
        });
    });

    describe('crearFamiliar', () => {
        it('debe crear y retornar un nuevo familiar', async () => {
            const mockFamiliar = { id: 1, nombre: 'Carlos' };
            Familiar.create.mockResolvedValue(mockFamiliar);

            const result = await familiarService.crearFamiliar(1, { nombre: 'Carlos' });

            expect(result).toEqual(mockFamiliar);
        });

        it('debe lanzar error si ocurre un fallo al crear', async () => {
            Familiar.create.mockRejectedValue(new Error('DB error'));

            await expect(
                familiarService.crearFamiliar(1, { nombre: 'Fallo' })
            ).rejects.toThrow(`${errorMessages.errorCrearFamiliar}DB error`);
        });
    });

    describe('actualizarFamiliar', () => {
		it('debe actualizar un familiar', async () => {
			const mockFamiliar = {
				id_familiar: 1,
				nombre: 'AntiguoNombre',
				toJSON: () => ({ id_familiar: 1, nombre: 'AntiguoNombre' }),
				update: jest.fn().mockResolvedValue({ nombre: 'NuevoNombre' }),
			};

			const result = await familiarService.actualizarDatosFamiliar(mockFamiliar, {
				nombre: 'NuevoNombre',
			}, 123); // id_usuario_modificador

			expect(result).toEqual(mockFamiliar);
		});

		it('debe lanzar error si falla la actualización', async () => {
			const mockFamiliar = {
				id_familiar: 1,
				nombre: 'AntiguoNombre',
				toJSON: () => ({ id_familiar: 1, nombre: 'AntiguoNombre' }),
				update: jest.fn().mockRejectedValue(new Error('Update failed')),
			};

			await expect(
				familiarService.actualizarDatosFamiliar(mockFamiliar, { nombre: 'Error' }, 123)
			).rejects.toThrow(`Error al actualizar datos del familiar: Update failed`);

		});
	});


    describe('obtenerFamiliarPorId', () => {
        it('debe retornar el familiar si se encuentra', async () => {
            const mockFamiliar = { id: 1, nombre: 'Lucía' };
            Familiar.findByPk.mockResolvedValue(mockFamiliar);

            const result = await familiarService.obtenerFamiliarPorId(1);

            expect(result).toEqual(mockFamiliar);
        });

        it('debe lanzar error si no se encuentra', async () => {
            Familiar.findByPk.mockResolvedValue(null);

            await expect(
                familiarService.obtenerFamiliarPorId(999)
            ).rejects.toThrow(errorMessages.familiarNoEncontrado);
        });

        it('debe lanzar error si ocurre una excepción', async () => {
            Familiar.findByPk.mockRejectedValue(new Error('DB error'));

            await expect(
                familiarService.obtenerFamiliarPorId(999)
            ).rejects.toThrow(`${errorMessages.errorObtenerFamiliar}: DB error`);
        });
    });
});
