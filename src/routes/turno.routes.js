const express = require('express');
const router = express.Router();
const { getTurnos } = require('../controllers/turno.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Ruta única para obtener turnos con filtros opcionales
router.get("/get", verificarToken, authorizeRole(["ver_turno"]), getTurnos);

module.exports = router;