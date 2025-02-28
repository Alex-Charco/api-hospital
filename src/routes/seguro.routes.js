const express = require('express');
const router = express.Router();
const { 
    registrarSeguro, 
    getBySeguro, 
    actualizarSeguro 
} = require('../controllers/seguro.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Registrar seguro de un paciente (solo administradores)
router.post('/registrar/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios"]), registrarSeguro);

// Obtener seguro de un paciente (solo administradores y médicos)
router.get('/get/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios", "ver_informacion"]), getBySeguro);

// Actualizar seguro de un paciente (solo administradores)
router.put('/put/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios"]), actualizarSeguro);

module.exports = router;
