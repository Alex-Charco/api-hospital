const express = require('express');
const router = express.Router();
const { registrarPaciente, getPaciente, actualizarPaciente, getHistorialPorIdentificacion, obtenerDetallePorCita } = require('../controllers/paciente.controller');
const { verificarToken, authorizeRole, } = require('../middlewares/auth.middleware');

// Ruta para registrar un paciente
router.post('/registrar', verificarToken, authorizeRole(["gestionar_usuarios"]),  registrarPaciente);
// Ruta para obtener un paciente
router.get('/get/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios", "ver_paciente"]), getPaciente);
router.get('/get/id_usuario/:id_usuario', verificarToken, authorizeRole(["gestionar_usuarios", "ver_paciente"]), getPaciente);
// Actualizar información militar por paciente
router.put('/put/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios"]), actualizarPaciente);
// Ruta del hsitorial de cambios
router.get('/get/historial/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios"]), getHistorialPorIdentificacion);
// Nueva ruta para obtener detalle completo desde cita
router.get('/get/detalle-por-cita/:id_cita', verificarToken, authorizeRole(["gestionar_historial"]), obtenerDetallePorCita);

module.exports = router;
