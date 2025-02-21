const express = require('express');
const router = express.Router();
const { login, registrarUsuario } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/login', login);
router.post('/register', verificarToken, registrarUsuario);

module.exports = router;
