const express = require('express');
const router = express.Router();
const {
    obtenerDatosAutorizado
} = require('../controllers/receta_autorizacion.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Obtener nota evolutiva por ID de cita o cédula de paciente
router.get('/get', verificarToken, authorizeRole(["gestionar_receta"]), obtenerDatosAutorizado);

module.exports = router;
