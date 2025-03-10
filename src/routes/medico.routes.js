const express = require('express');
const router = express.Router();
const { registrarMedico, getMedico, actualizarMedico } = require('../controllers/medico.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Ruta para registrar un médico
router.post('/registrar', verificarToken, authorizeRole(["gestionar_usuarios"]), registrarMedico);

// Ruta para obtener un médico por identificación
router.get('/get/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios", "ver_medico"]), getMedico);

// Ruta para actualizar un médico
router.put('/put/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios"]), actualizarMedico);

module.exports = router;
