const express = require('express');
const router = express.Router();
const { login, registrarUsuario, getUsuario } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/login', login);
router.post('/register', verificarToken, registrarUsuario);
router.get('/get/:nombre_usuario', verificarToken, getUsuario);
module.exports = router;
