const express = require('express');
const router = express.Router();
const { getTurnos, getTurnosDisponibles } = require('../controllers/turno.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Ruta única para obtener turnos con filtros opcionales
router.get("/get", verificarToken, authorizeRole(["ver_turno"]), getTurnos);
router.get("/get/disponibles", verificarToken, authorizeRole(["ver_turno"]), getTurnosDisponibles);
module.exports = router;