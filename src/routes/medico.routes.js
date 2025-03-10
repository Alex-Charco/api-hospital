const express = require('express');
const router = express.Router();
const { registrarMedico,  obtenerMedicos, actualizarMedico } = require('../controllers/medico.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Ruta para registrar un médico
router.post('/registrar', verificarToken, authorizeRole(["gestionar_usuarios"]), registrarMedico);

// Rutas para administradores y médicos
router.get('/get/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios", "ver_medico"]), obtenerMedicos);
//Rutas para administradores
router.get('/getAll', verificarToken, authorizeRole(["gestionar_usuarios"]), obtenerMedicos);

// Ruta para actualizar un médico
router.put('/put/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios"]), actualizarMedico);

module.exports = router;
