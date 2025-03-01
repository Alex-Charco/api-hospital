const express = require('express');
const router = express.Router();
const {
    registrarHorario,
    getByHorario,
    actualizarHorario,
} = require('../controllers/horario.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Registrar horario de un médico (solo administradores)
router.post('/registrar/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios"]), registrarHorario);

// Obtener horario de un médico
router.get('/get/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios", "ver_informacion"]), getByHorario);

// Actualizar horario de un médico (solo administradores)
router.put('/put/:identificacion', verificarToken, authorizeRole(["gestionar_usuarios"]), actualizarHorario);

module.exports = router;
