
const sequelize = {
  transaction: jest.fn((callback) => callback({}))
};
// Mock manual para los modelos para evitar conexión real
const transactionMock = jest.fn((callback) => callback({}));

jest.mock('../models', () => ({
  sequelize: {
    transaction: jest.fn((callback) => callback({})), // función inline aquí
  },
  InfoMilitar: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Paciente: {
    findOne: jest.fn(),
  },
  HistorialCambiosInfoMilitar: {
    bulkCreate: jest.fn(), // ✅ Añadir este mock
  },
}));

const { InfoMilitar, Paciente, HistorialCambiosInfoMilitar } = require('../models');
const errorMessages = require('../utils/error_messages');
const infoMilitarService = require('../services/info_militar.service');

beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    jest.spyOn(console, 'log').mockImplementation(() => { });
});

afterAll(() => {
    console.warn.mockRestore();
    console.log.mockRestore();
});

describe('info_militar.service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validarPacienteExistente', () => {
        it('debe retornar el paciente si existe', async () => {
            const mockPaciente = { id_paciente: 1, identificacion: '123' };
            Paciente.findOne.mockResolvedValue(mockPaciente);

            const result = await infoMilitarService.validarPacienteExistente('123');
            expect(result).toBe(mockPaciente);
            expect(Paciente.findOne).toHaveBeenCalledWith({ where: { identificacion: '123' } });
        });

        it('debe retornar null si no existe paciente', async () => {
            Paciente.findOne.mockResolvedValue(null);
            const result = await infoMilitarService.validarPacienteExistente('999');
            expect(result).toBeNull();
        });

        it('debe lanzar error si hay excepción', async () => {
            Paciente.findOne.mockRejectedValue(new Error('DB error'));
            await expect(infoMilitarService.validarPacienteExistente('123')).rejects.toThrow(errorMessages.errorValidarPaciente);
        });
    });

    describe('validarPacienteMilitar', () => {
        it('no debe lanzar error si tipo_paciente es MILITAR', async () => {
            const paciente = { tipo_paciente: 'MILITAR' };
            await expect(infoMilitarService.validarPacienteMilitar(paciente)).resolves.toBeUndefined();
        });

        it('debe lanzar error si tipo_paciente no es MILITAR', async () => {
            const paciente = { tipo_paciente: 'CIVIL' };
            await expect(infoMilitarService.validarPacienteMilitar(paciente)).rejects.toThrow(errorMessages.pacienteMilitar);
        });
    });

    describe('validarInfoMilitarNoRegistrada', () => {
        it('debe lanzar error si info militar ya existe', async () => {
            InfoMilitar.findOne.mockResolvedValue({ id_info: 1 });
            await expect(infoMilitarService.validarInfoMilitarNoRegistrada(1)).rejects.toThrow(errorMessages.infoMilitarRegistrada);
        });

        it('no debe lanzar error si info militar no existe', async () => {
            InfoMilitar.findOne.mockResolvedValue(null);
            await expect(infoMilitarService.validarInfoMilitarNoRegistrada(1)).resolves.toBeUndefined();
        });
    });

    describe('obtenerInfoMilitar', () => {
        it('debe retornar info militar si existe', async () => {
            const mockInfo = { id_info: 1, id_paciente: 1 };
            InfoMilitar.findOne.mockResolvedValue(mockInfo);
            const result = await infoMilitarService.obtenerInfoMilitar(1);
            expect(result).toBe(mockInfo);
        });

        it('debe lanzar error si info militar no existe', async () => {
            InfoMilitar.findOne.mockResolvedValue(null);
            await expect(infoMilitarService.obtenerInfoMilitar(1)).rejects.toThrow(errorMessages.infoMilitarNoEncontrada);
        });
    });

    describe('crearInfoMilitar', () => {
        it('debe crear y retornar nueva info militar', async () => {
            const datosMilitares = { cargo: 'Soldado', grado: 'Sargento' };
            const mockCreated = { id_info: 1, id_paciente: 1, ...datosMilitares };
            InfoMilitar.create.mockResolvedValue(mockCreated);

            const result = await infoMilitarService.crearInfoMilitar(1, datosMilitares);
            expect(InfoMilitar.create).toHaveBeenCalledWith({ id_paciente: 1, ...datosMilitares });
            expect(result).toBe(mockCreated);
        });
    });

    describe('actualizarInfoMilitar', () => {
    it('debe actualizar info militar y retornar', async () => {
        const mockInfoMilitar = {
            id_info_militar: 1,
            get: jest.fn().mockReturnValue({ grado: 'Teniente' }),
            update: jest.fn()
        };

        const nuevosDatos = { grado: 'Capitán' };
        const mockUpdated = { id_info: 1, grado: 'Capitán' };

        mockInfoMilitar.update.mockResolvedValue(mockUpdated);

        const result = await infoMilitarService.actualizarInfoMilitar(mockInfoMilitar, nuevosDatos, 123); // ⬅️ id_usuario agregado

        expect(mockInfoMilitar.update).toHaveBeenCalledWith(nuevosDatos, expect.any(Object)); // incluye { transaction }
		expect(HistorialCambiosInfoMilitar.bulkCreate).toHaveBeenCalled();
        expect(result).toBe(mockUpdated);
    });
});

});
