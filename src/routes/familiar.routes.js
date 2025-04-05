const express = require('express');
const router = express.Router();
const { 
    registrarFamiliar, 
    getByFamiliar, 
    actualizarFamiliar 
} = require('../controllers/familiar.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Crear un nuevo familiar
router.post('/registrar/:identificacionPaciente', verificarToken, authorizeRole(["gestionar_usuarios"]), registrarFamiliar);

// Obtener familiares por paciente (usando identificacion, no id_paciente)
router.get('/get/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios", "ver_informacion"]), getByFamiliar);

// Solo se pasa la identificación del paciente
router.put('/put/:identificacionPaciente', verificarToken, authorizeRole(["gestionar_usuarios"]), actualizarFamiliar);

module.exports = router;
