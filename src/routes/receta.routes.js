const express = require('express');
const router = express.Router();
const {
    registrarReceta,
    obtenerRecetas,
	obtenerDiagnosticosPorNota,
	obtenerOpcionesAutorizado,
	obtenerRecetaPorCita,
    actualizarReceta
} = require('../controllers/receta.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Registrar una nueva receta
router.post('/registrar', verificarToken, authorizeRole(["gestionar_receta"]), registrarReceta);

// Obtener nota evolutiva por ID de cita o cédula de paciente
router.get('/get', verificarToken, authorizeRole(["gestionar_receta"]), obtenerRecetas);

// Obtener nota evolutiva por ID de nota
router.get('/get/diagnostico-por-nota/:id_nota_evolutiva', verificarToken, authorizeRole(["gestionar_receta"]), obtenerDiagnosticosPorNota);

// Obtener datos paciente/familiar por ID paciente
router.get('/get/autorizacion/opciones', verificarToken, authorizeRole(["gestionar_receta"]), obtenerOpcionesAutorizado);

// Obtener datos por id_cita
router.get('/get/por-cita', verificarToken, authorizeRole(['gestionar_receta']), obtenerRecetaPorCita);

// Actualizar nota evolutiva
router.put('/put/:id_receta', verificarToken, authorizeRole(["gestionar_receta"]), actualizarReceta);

module.exports = router;