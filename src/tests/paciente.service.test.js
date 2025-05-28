const pacienteService = require("../services/paciente.service");
const { verificarUsuarioExistente } = require("../services/user.service");
const errorMessages = require("../utils/error_messages");

jest.mock("../services/user.service");

jest.mock("../utils/date_utils", () => ({
    formatFechaCompleta: () => "2024-01-01 10:00:00",
}));

jest.mock("../models", () => {
    const PacienteMock = {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
    };

    const HistorialMock = {
        bulkCreate: jest.fn(),
    };

    return {
        Paciente: PacienteMock,
        HistorialCambiosPaciente: HistorialMock,
        Usuario: {},
        RolUsuario: {},
        Familiar: {},
        InfoMilitar: {},
        Residencia: {},
        Seguro: {},
    };
});

describe("Paciente Service", () => {
    const { Paciente, HistorialCambiosPaciente } = require("../models");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("obtenerPacientePorId debe retornar un paciente por ID", async () => {
        const mockPaciente = { id: 1, nombre: "Ana" };
        Paciente.findByPk.mockResolvedValue(mockPaciente);

        const result = await pacienteService.obtenerPacientePorId(1);
        expect(result).toEqual(mockPaciente);
    });

    test("obtenerPacientePorIdUsuario debe retornar un paciente por id_usuario", async () => {
        const mockPaciente = { id: 2, nombre: "Luis" };
        Paciente.findOne.mockResolvedValue(mockPaciente);

        const result = await pacienteService.obtenerPacientePorIdUsuario(5);
        expect(result).toEqual(mockPaciente);
    });

    test("crearPaciente debe crear un paciente", async () => {
        const pacienteData = { nombre: "Pedro" };
        const createdPaciente = { id: 3, ...pacienteData };
        Paciente.create.mockResolvedValue(createdPaciente);

        const result = await pacienteService.crearPaciente(pacienteData);
        expect(result).toEqual(createdPaciente);
    });

    test("actualizarDatosPaciente debe actualizar y registrar cambios", async () => {
        const datosAntes = {
            id_paciente: 1,
            nombre: "Mario",
            apellido: "Lopez",
            toJSON: () => ({ nombre: "Mario", apellido: "Lopez" }),
            update: jest.fn().mockResolvedValue(),
        };
        const nuevosDatos = { nombre: "Mario Actualizado", apellido: "Lopez" };
        const id_usuario_modificador = 99;

        const result = await pacienteService.actualizarDatosPaciente(
            datosAntes,
            nuevosDatos,
            id_usuario_modificador
        );

        expect(datosAntes.update).toHaveBeenCalledWith(nuevosDatos);
        expect(HistorialCambiosPaciente.bulkCreate).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    campo_modificado: "nombre",
                    valor_anterior: "Mario",
                    valor_nuevo: "Mario Actualizado",
                    id_usuario: id_usuario_modificador,
                    id_paciente: 1,
                }),
            ])
        );
        expect(result).toEqual(datosAntes);
    });

    test("actualizarDatosPaciente no debe actualizar si no hay cambios", async () => {
        const pacienteMock = {
            id_paciente: 1,
            nombre: "Mario",
            apellido: "Lopez",
            toJSON: () => ({ nombre: "Mario", apellido: "Lopez" }),
            update: jest.fn(),
        };

        const nuevosDatos = { nombre: "Mario", apellido: "Lopez" }; // sin cambios

        const result = await pacienteService.actualizarDatosPaciente(
            pacienteMock,
            nuevosDatos,
            99
        );

        expect(pacienteMock.update).not.toHaveBeenCalled();
        expect(HistorialCambiosPaciente.bulkCreate).not.toHaveBeenCalled();
        expect(result).toEqual(pacienteMock);
    });

    test("actualizarDatosPaciente lanza error si ocurre una excepción", async () => {
        const pacienteMock = {
            id_paciente: 1,
            nombre: "Mario",
            apellido: "Lopez",
            toJSON: () => {
                throw new Error("Falló toJSON");
            },
            update: jest.fn(),
        };

        const nuevosDatos = { nombre: "Mario Actualizado" };

        await expect(
            pacienteService.actualizarDatosPaciente(pacienteMock, nuevosDatos, 99)
        ).rejects.toThrow("Error al actualizar datos del paciente");
    });

    test("obtenerHistorialPorIdentificacion debe retornar historial si paciente existe", async () => {
        const mockPaciente = { id_paciente: 1 };
        const mockHistorial = [
            {
                toJSON: () => ({
                    campo_modificado: "nombre",
                    valor_anterior: "Juan",
                    valor_nuevo: "Pedro",
                    fecha_cambio: new Date("2024-01-01T00:00:00Z"),
                }),
            },
        ];

        Paciente.findOne.mockResolvedValue(mockPaciente);
        HistorialCambiosPaciente.findAll = jest
            .fn()
            .mockResolvedValue(mockHistorial);

        const result = await pacienteService.obtenerHistorialPorIdentificacion(
            "123456"
        );

        expect(result).toEqual([
            expect.objectContaining({
                campo_modificado: "nombre",
                valor_anterior: "Juan",
                valor_nuevo: "Pedro",
                fecha_cambio: "2024-01-01 10:00:00", // formateada por mock
            }),
        ]);
    });

    test("obtenerHistorialPorIdentificacion lanza error si paciente no existe", async () => {
        Paciente.findOne.mockResolvedValue(null);
        await expect(
            pacienteService.obtenerHistorialPorIdentificacion("999")
        ).rejects.toThrow("Paciente no encontrado con esa identificación.");
    });

    test("validarUsuarioParaPaciente lanza error si no existe el usuario", async () => {
        verificarUsuarioExistente.mockResolvedValue(null);
        await expect(
            pacienteService.validarUsuarioParaPaciente("invalido")
        ).rejects.toThrow(errorMessages.usuarioNoExistente);
    });

    test("validarUsuarioParaPaciente lanza error si rol no es paciente", async () => {
        verificarUsuarioExistente.mockResolvedValue({ id_usuario: 1, id_rol: 2 });
        await expect(
            pacienteService.validarUsuarioParaPaciente("usuario")
        ).rejects.toThrow(errorMessages.usuarioNoEsPaciente);
    });

    test("validarUsuarioParaPaciente lanza error si ya está registrado como paciente", async () => {
        verificarUsuarioExistente.mockResolvedValue({ id_usuario: 5, id_rol: 1 });
        Paciente.findOne.mockResolvedValue({ id_paciente: 123 });

        await expect(
            pacienteService.validarUsuarioParaPaciente("usuario")
        ).rejects.toThrow(errorMessages.usuarioRegistradoPaciente);
    });

    test("validarUsuarioParaPaciente retorna usuario válido", async () => {
        const mockUsuario = { id_usuario: 5, id_rol: 1 };
        verificarUsuarioExistente.mockResolvedValue(mockUsuario);
        Paciente.findOne.mockResolvedValue(null);

        const result = await pacienteService.validarUsuarioParaPaciente("valido");
        expect(result).toEqual(mockUsuario);
    });

    test("validarIdentificacionPaciente lanza error si identificación existe", async () => {
        Paciente.findOne.mockResolvedValue({ identificacion: "123" });

        await expect(
            pacienteService.validarIdentificacionPaciente("123")
        ).rejects.toThrow(errorMessages.pacienteYaRegistrado);
    });

    test("validarIdentificacionPaciente no lanza error si identificación es única", async () => {
        Paciente.findOne.mockResolvedValue(null);

        await expect(
            pacienteService.validarIdentificacionPaciente("123")
        ).resolves.toBeUndefined();
    });

    test("obtenerPacientePorIdentificacion retorna paciente con relaciones", async () => {
        const pacienteMock = { id_paciente: 7, nombre: "Test" };
        Paciente.findOne.mockResolvedValue(pacienteMock);

        const result = await pacienteService.obtenerPacientePorIdentificacion(
            "123"
        );
        expect(result).toEqual(pacienteMock);
    });

    test("obtenerPacientePorIdentificacion lanza error si hay fallo", async () => {
        Paciente.findOne.mockRejectedValue(new Error("DB error"));
        await expect(
            pacienteService.obtenerPacientePorIdentificacion("123")
        ).rejects.toThrow(errorMessages.errorObtenerPaciente);
    });

    test("obtenerHistorialPorIdentificacion retorna historial con fecha formateada", async () => {
        const mockPaciente = { id_paciente: 1 };
        const mockHistorialRaw = [
            {
                toJSON: () => ({
                    campo_modificado: "nombre",
                    valor_anterior: "Juan",
                    valor_nuevo: "Pedro",
                    fecha_cambio: new Date("2024-01-01T00:00:00Z"),
                }),
            },
        ];

        Paciente.findOne.mockResolvedValue(mockPaciente);
        HistorialCambiosPaciente.findAll.mockResolvedValue(mockHistorialRaw);

        const result = await pacienteService.obtenerHistorialPorIdentificacion(
            "123456"
        );

        expect(result).toEqual([
            expect.objectContaining({
                campo_modificado: "nombre",
                valor_anterior: "Juan",
                valor_nuevo: "Pedro",
                fecha_cambio: "2024-01-01 10:00:00", // formateada
            }),
        ]);
    });
});
