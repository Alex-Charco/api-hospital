const express = require('express');
const router = express.Router();
const { getCitas, getCitasPorPaciente, registrarCita, getCitasPorMedico } = require('../controllers/cita.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Obtener citas por identificación de paciente o médico
router.get('/get/paciente/:identificacionPaciente/v1', verificarToken, authorizeRole(["gestionar_cita", "ver_cita"]), getCitas);

router.get('/get/medico/:identificacionMedico/v1', verificarToken, authorizeRole(["gestionar_cita", "ver_informacion"]), getCitas);

// Ruta para obtener citas de un paciente específico
router.get('/get/paciente/:identificacionPaciente',  verificarToken, authorizeRole(["gestionar_cita", "ver_cita"]), getCitasPorPaciente);

//  Ruta para medico/
router.get('/get/medico/:identificacionMedico', verificarToken, authorizeRole(["gestionar_cita", "ver_informacion"]), getCitasPorMedico);

router.post('/registrar', verificarToken, authorizeRole(["gestionar_cita", "registrar_cita"]), registrarCita);

module.exports = router;
