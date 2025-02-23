const express = require('express');
const router = express.Router();
const { registrarPaciente, obtenerPaciente, actualizarPaciente } = require('../controllers/paciente.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Ruta para registrar un paciente
router.post('/registrar', verificarToken, registrarPaciente);
// Ruta para registrar un paciente
router.get('/get/:identificacion', verificarToken, obtenerPaciente);
// Actualizar información militar por paciente
router.put('/put/:identificacion', verificarToken, actualizarPaciente);

module.exports = router;
