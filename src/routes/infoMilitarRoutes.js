// routes/InfoMilitarRoutes.js
const express = require('express');
const router = express.Router();
const {registrarInfoMilitar, getByInfoMilitar, actualizarInfoMilitar } = require('../controllers/infoMilitar.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Crear nueva información militar
router.post('/registrar', verificarToken, registrarInfoMilitar);
// Obtener información militar por paciente
router.get('/get/:identificacion', verificarToken, getByInfoMilitar);
// Actualizar información militar por paciente
router.put('/put/:identificacion', verificarToken, actualizarInfoMilitar);


module.exports = router;
