const express = require('express');
const router = express.Router();
const { 
    getCita
} = require('../controllers/cita.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Obtener citas de un paciente por identificación
router.get('/get/:identificacion', verificarToken, authorizeRole(["gestionar_cita", "ver_informacion"]), getCita);

module.exports = router;
