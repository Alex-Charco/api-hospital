const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const {
    verificarUsuarioExistente,
    cifrarPassword,
    actualizarEstatusUsuario
} = require('../services/user.service');

jest.mock('../models', () => ({
    Usuario: {
        findOne: jest.fn(),
    }
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
}));

describe('user.service.js - Registro de usuario', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('verificarUsuarioExistente', () => {
        it('debe devolver un usuario si existe', async () => {
            const mockUser = { id_usuario: 1, nombre_usuario: 'usuario1' };
            Usuario.findOne.mockResolvedValue(mockUser);

            const result = await verificarUsuarioExistente('usuario1');

            expect(Usuario.findOne).toHaveBeenCalledWith({ where: { nombre_usuario: 'usuario1' } });
            expect(result).toEqual(mockUser);
        });

        it('debe devolver null si el usuario no existe', async () => {
            Usuario.findOne.mockResolvedValue(null);

            const result = await verificarUsuarioExistente('noExiste');

            expect(Usuario.findOne).toHaveBeenCalledWith({ where: { nombre_usuario: 'noExiste' } });
            expect(result).toBeNull();
        });
    });

	const PASSWORD_SEGURA = 'miPasswordSegura';
    describe('cifrarPassword', () => {
        it('debe devolver una contraseña cifrada', async () => {
            const mockHash = 'hashedPassword123';
            bcrypt.hash.mockResolvedValue(mockHash);

            const password = PASSWORD_SEGURA;
            const result = await cifrarPassword(password);

            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            expect(result).toBe(mockHash);
        });
    });
});

// * Actualizar estatus del usuario

describe('actualizarEstatusUsuario', () => {
    it('debe actualizar el estatus del usuario si existe', async () => {
        const mockUser = {
            nombre_usuario: 'usuario1',
            estatus: 0,
            save: jest.fn().mockResolvedValue(true) // 👈 importante
        };

        Usuario.findOne.mockResolvedValue(mockUser);

        const result = await actualizarEstatusUsuario('usuario1', 1);

        expect(Usuario.findOne).toHaveBeenCalledWith({
            where: { nombre_usuario: 'usuario1' },
            include: expect.any(Array)
        });

        expect(mockUser.estatus).toBe(1); // Verifica que se haya actualizado
        expect(mockUser.save).toHaveBeenCalled(); // Verifica que se haya guardado
        expect(result).toBe(mockUser); // Verifica que se devuelva el usuario actualizado
    });

    it('debe devolver null si el usuario no existe', async () => {
        Usuario.findOne.mockResolvedValue(null);

        const result = await actualizarEstatusUsuario('usuarioInexistente', 1);

        expect(Usuario.findOne).toHaveBeenCalledWith({
            where: { nombre_usuario: 'usuarioInexistente' },
            include: expect.any(Array)
        });

        expect(result).toBeNull();
    });
});
