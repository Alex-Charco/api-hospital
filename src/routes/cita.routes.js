const express = require('express');
const router = express.Router();
const { getCita } = require('../controllers/cita.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Obtener citas por identificación de paciente o médico
router.get('/get', verificarToken, authorizeRole(["gestionar_cita", "ver_informacion"]), getCita);

module.exports = router;
