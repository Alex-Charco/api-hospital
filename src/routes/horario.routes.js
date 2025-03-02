const express = require('express');
const router = express.Router();
const {
    registrarHorario,
    getByHorario
} = require('../controllers/horario.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Registrar horario de un médico (solo administradores)
router.post('/registrar/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios"]), registrarHorario);

// Obtener horario de un médico
router.get('/get/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios", "ver_informacion"]), getByHorario);

module.exports = router;
