// routes/InfoMilitarRoutes.js
const express = require('express');
const router = express.Router();
const infoMilitarController = require('../controllers/infoMilitar.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Crear nueva información militar
router.post('/registrar', verificarToken, infoMilitarController.registrarInfoMilitar);
// Obtener información militar por paciente
router.get('/get/:identificacion', verificarToken, infoMilitarController.getByInfoMilitar);
module.exports = router;
