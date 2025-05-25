const pacienteService = require('../services/paciente.service');

jest.mock('../models', () => {
    const PacienteMock = {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    };
    return {
        Paciente: PacienteMock,
    };
});

jest.mock('../services/user.service');

describe('Paciente Service', () => {
    const { Paciente } = require('../models');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getPacienteById debe retornar un paciente por ID', async () => {
        const mockPaciente = { id: 1, nombre: 'Ana' };
        Paciente.findByPk.mockResolvedValue(mockPaciente);

        const result = await pacienteService.obtenerPacientePorId(1);
        expect(result).toEqual(mockPaciente);
    });

    test('getPacienteByUserId debe retornar un paciente por userId', async () => {
        const mockPaciente = { id: 2, nombre: 'Luis' };
        Paciente.findOne.mockResolvedValue(mockPaciente);

        const result = await pacienteService.obtenerPacientePorIdUsuario(5);
        expect(result).toEqual(mockPaciente);
    });

    test('crearPaciente debe crear un paciente', async () => {
        const pacienteData = { nombre: 'Pedro' };
        const createdPaciente = { id: 3, ...pacienteData };
        Paciente.create.mockResolvedValue(createdPaciente);

        const result = await pacienteService.crearPaciente(pacienteData);
        expect(result).toEqual(createdPaciente);
    });

    test('actualizarDatosPaciente debe actualizar un paciente', async () => {
        const mockPaciente = {
            update: jest.fn().mockResolvedValue({ id: 1, nombre: 'Mario Actualizado' })
        };
        const pacienteData = { nombre: 'Mario' };

        const result = await pacienteService.actualizarDatosPaciente(mockPaciente, pacienteData);
        expect(mockPaciente.update).toHaveBeenCalledWith(pacienteData);
        expect(result).toEqual({ id: 1, nombre: 'Mario Actualizado' });
    });
});
