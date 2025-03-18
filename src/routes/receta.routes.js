const express = require('express');
const router = express.Router();
const {
    registrarReceta,
    obtenerRecetas,
    actualizarReceta
} = require('../controllers/receta.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Registrar una nueva receta
router.post('/registrar', verificarToken, authorizeRole(["gestionar_receta"]), registrarReceta);

// Obtener nota evolutiva por ID de cita o cédula de paciente
router.get('/get', verificarToken, authorizeRole(["gestionar_receta"]), obtenerRecetas);

// Actualizar nota evolutiva
router.put('/put/:id_receta', verificarToken, authorizeRole(["gestionar_receta"]), actualizarReceta);

module.exports = router;