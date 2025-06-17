const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistencia.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Ruta para obtener la asistencia por ID de cita
router.get('/get/:id_cita', verificarToken, authorizeRole(["asistencia"]), asistenciaController.getAsistenciaByCita);
router.post('/registrar', verificarToken, authorizeRole(["asistencia"]), asistenciaController.createAsistencia);

module.exports = router;
