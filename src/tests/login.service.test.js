const bcrypt = require('bcryptjs');

// Servicios a testear directamente
const {
  buscarUsuario,
  verificarUsuarioExistente,
  verificarPassword,
  obtenerDatosUsuario
} = require('../services/user.service');

// Mock del controlador
const { login } = require('../controllers/auth.controller');

// Mock de modelos (solo esto)
jest.mock('../models', () => ({
  Usuario: { findOne: jest.fn() },
  RolUsuario: {},
  Paciente: { findOne: jest.fn() },
  Medico: { findOne: jest.fn() },
  Administrador: { findOne: jest.fn() }
}));

const { Usuario, Paciente, Medico, Administrador } = require('../models');

describe('Servicios y controlador de Login', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        nombre_usuario: 'usuario_test',
        password: 'clave_incorrecta'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------
  // Test del controlador login()
  // ----------------------------
  describe('Controlador login()', () => {
    test('debería responder con 401 si la contraseña es incorrecta', async () => {
      Usuario.findOne.mockResolvedValue({
        password: await bcrypt.hash('otra_clave', 10),
        estatus: 1,
        rol: { id_rol: 1, nombre_rol: 'admin', permiso: [] },
        id_usuario: 1,
        nombre_usuario: 'usuario_test',
        fecha_creacion: new Date()
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales inválidas.' });
    });
  });

  // ----------------------------
  // Test unitarios de servicios
  // ----------------------------

  describe('buscarUsuario()', () => {
    test('debe retornar un usuario con su rol', async () => {
      const mockUsuario = {
        nombre_usuario: 'juan',
        rol: {
          nombre_rol: 'paciente'
        }
      };

      Usuario.findOne.mockResolvedValue(mockUsuario);

      const result = await buscarUsuario('juan');
      expect(Usuario.findOne).toHaveBeenCalledWith({
        where: { nombre_usuario: 'juan' },
        include: [{
          model: expect.anything(),
          as: 'rol',
          attributes: ['id_rol', 'nombre_rol', 'permiso', 'estatus']
        }]
      });
      expect(result).toEqual(mockUsuario);
    });
  });

  describe('verificarUsuarioExistente()', () => {
    test('debe retornar un usuario si ya existe', async () => {
      const usuarioExistente = { nombre_usuario: 'ana' };
      Usuario.findOne.mockResolvedValue(usuarioExistente);

      const result = await verificarUsuarioExistente('ana');
      expect(Usuario.findOne).toHaveBeenCalledWith({ where: { nombre_usuario: 'ana' } });
      expect(result).toEqual(usuarioExistente);
    });
  });

  describe('verificarPassword()', () => {
    test('debe retornar true si la contraseña es válida', async () => {
      const password = '123456';
      const hashed = await bcrypt.hash(password, 10);

      const result = await verificarPassword(password, hashed);
      expect(result).toBe(true);
    });

    test('debe retornar false si la contraseña es inválida', async () => {
      const password = '123456';
      const hashed = await bcrypt.hash('otra', 10);

      const result = await verificarPassword(password, hashed);
      expect(result).toBe(false);
    });
  });

  describe('obtenerDatosUsuario()', () => {
    test('debe retornar datos del paciente si existe', async () => {
      const datos = { primer_nombre: 'Pedro', estatus: 1 };
      Paciente.findOne.mockResolvedValue(datos);

      const result = await obtenerDatosUsuario(1);
      expect(result).toEqual({ ...datos, tipo: 'paciente' });
    });

    test('debe retornar datos del médico si el paciente no existe', async () => {
      Paciente.findOne.mockResolvedValue(null);
      Medico.findOne.mockResolvedValue({ primer_nombre: 'Laura', estatus: 1 });

      const result = await obtenerDatosUsuario(2);
      expect(result).toEqual({ primer_nombre: 'Laura', estatus: 1, tipo: 'medico' });
    });

    test('debe retornar datos del administrador si los anteriores no existen', async () => {
      Paciente.findOne.mockResolvedValue(null);
      Medico.findOne.mockResolvedValue(null);
      Administrador.findOne.mockResolvedValue({ primer_nombre: 'Admin', estatus: 1 });

      const result = await obtenerDatosUsuario(3);
      expect(result).toEqual({ primer_nombre: 'Admin', estatus: 1, tipo: 'administrador' });
    });

    test('debe retornar null si no encuentra ningún rol', async () => {
      Paciente.findOne.mockResolvedValue(null);
      Medico.findOne.mockResolvedValue(null);
      Administrador.findOne.mockResolvedValue(null);

      const result = await obtenerDatosUsuario(99);
      expect(result).toBeNull();
    });
  });
});
