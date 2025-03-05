const express = require('express');
const router = express.Router();
const { getCita, registrarCita } = require('../controllers/cita.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Obtener citas por identificación de paciente o médico
router.get('/get/:identificacionPaciente', verificarToken, authorizeRole(["gestionar_cita", "ver_cita"]), getCita);

router.get('/get/medico/:identificacionMedico', verificarToken, authorizeRole(["gestionar_cita", "ver_informacion"]), getCita);

router.post('/registrar', verificarToken, authorizeRole(["gestionar_cita", "registrar_cita"]), registrarCita);

module.exports = router;
