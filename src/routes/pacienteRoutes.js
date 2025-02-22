const express = require('express');
const router = express.Router();
const { registrarPaciente } = require('../controllers/paciente.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Ruta para registrar un paciente
router.post('/registrar', verificarToken, registrarPaciente);

module.exports = router;
