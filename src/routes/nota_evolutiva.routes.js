const express = require('express');
const router = express.Router();
const {
    registrarNotaEvolutiva,
    obtenerNotaEvolutiva,
	obtenerNotaEvolutivaPorId,
    actualizarNotaEvolutiva
} = require('../controllers/nota_evolutiva.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Registrar una nueva nota evolutiva
router.post('/registrar', verificarToken, authorizeRole(["gestionar_historial"]), registrarNotaEvolutiva);

// Obtener nota evolutiva por ID de cita o cédula de paciente
router.get('/get', verificarToken, authorizeRole(["gestionar_historial"]), obtenerNotaEvolutiva);

// Obtener nota evolutiva por ID nota evolutiva
router.get('/get/nota/:id_nota_evolutiva', verificarToken, authorizeRole(["gestionar_historial"]), obtenerNotaEvolutivaPorId);

// Actualizar nota evolutiva
router.put('/put/:id_nota_evolutiva', verificarToken, authorizeRole(["gestionar_historial"]), actualizarNotaEvolutiva);

module.exports = router;
