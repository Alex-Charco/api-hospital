const express = require('express');
const router = express.Router();
const { 
    buscarPersonaExterna, 
    crearPersonaExterna, 
    actualizarPersonaExterna 
} = require('../controllers/persona_externa.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// 🔍 Buscar persona externa por ID o Identificación (Opcionalmente)
router.get('/get', verificarToken, authorizeRole(["gestionar_usuarios", "gestionar_personaexterna"]), buscarPersonaExterna);

// 🆕 Crear persona externa (solo administradores)
router.post('/registrar', verificarToken, authorizeRole(["gestionar_usuarios", "gestionar_personaexterna"]), crearPersonaExterna);

// 🔄 Actualizar persona externa (solo administradores)
router.put('/put/:id_persona_externa', verificarToken, authorizeRole(["gestionar_usuarios", "gestionar_personaexterna"]), actualizarPersonaExterna);

module.exports = router;