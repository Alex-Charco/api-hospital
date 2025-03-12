const express = require('express');
const router = express.Router();
const { getCitas, registrarCita } = require('../controllers/cita.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Obtener citas por identificación de paciente o médico
router.get('/get/paciente/:identificacionPaciente', verificarToken, authorizeRole(["gestionar_cita", "ver_cita"]), getCitas);

router.get('/get/medico/:identificacionMedico', verificarToken, authorizeRole(["gestionar_cita", "ver_informacion"]), getCitas);


// Ruta unificada para obtener citas (todas o solo pendientes del día)
//router.get('/get/:tipo/:identificacion', verificarToken, authorizeRole(["gestionar_cita", "ver_cita", "ver_informacion"]), getCitas);

router.post('/registrar', verificarToken, authorizeRole(["gestionar_cita", "registrar_cita"]), registrarCita);

module.exports = router;
