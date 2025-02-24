const express = require('express');
const router = express.Router();
const { login, registrarUsuario, getUsuario, updatePassword, putPassword, deleteUsuario } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/login', login);
router.post('/register', verificarToken, registrarUsuario);
router.get('/get/:nombre_usuario', verificarToken, getUsuario);
router.put('/put/:nombre_usuario/password', verificarToken, updatePassword);
router.put('/put/password/:nombre_usuario', verificarToken, putPassword);
router.delete('/delete/:nombre_usuario', verificarToken, deleteUsuario);
module.exports = router;
