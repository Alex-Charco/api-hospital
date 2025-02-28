const express = require('express');
const router = express.Router();
const { 
    registrarResidencia, 
    getByResidencia, 
    actualizarResidencia 
} = require('../controllers/residencia.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Crear una nueva residencia para un paciente (solo administradores)
router.post('/registrar/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios"]), registrarResidencia);

// Obtener residencia de un paciente (solo administradores y médicos)
router.get('/get/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios", "ver_informacion"]), getByResidencia);

// Actualizar la residencia de un paciente (solo administradores)
router.put('/put/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios"]), actualizarResidencia);

module.exports = router;
