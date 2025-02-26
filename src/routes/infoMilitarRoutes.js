// routes/InfoMilitarRoutes.js
const express = require('express');
const router = express.Router();
const {registrarInfoMilitar, getByInfoMilitar, actualizarInfoMilitar } = require('../controllers/infoMilitar.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Crear nueva información militar
router.post('/registrar', verificarToken, authorizeRole(["gestionar_usuarios"]), registrarInfoMilitar);
// Obtener información militar por paciente
router.get('/get/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios", "ver_informacion"]), getByInfoMilitar);
// Actualizar información militar por paciente
router.put('/put/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios"]), actualizarInfoMilitar);

module.exports = router;
