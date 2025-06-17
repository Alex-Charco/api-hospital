const express = require('express');
const router = express.Router();
const { getCitasPorPaciente, registrarCita, getCitasPorMedico } = require('../controllers/cita.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Ruta para obtener citas de un paciente específico
router.get('/get/paciente/:identificacionPaciente',  verificarToken, authorizeRole(["gestionar_cita", "ver_cita"]), getCitasPorPaciente);

//  Ruta para medico/
router.get('/get/medico/:identificacionMedico', verificarToken, authorizeRole(["gestionar_cita", "ver_informacion"]), getCitasPorMedico);

router.post('/registrar', verificarToken, authorizeRole(["gestionar_cita", "registrar_cita", "reagendar_cita"]), registrarCita);

module.exports = router;
