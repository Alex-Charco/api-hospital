const express = require('express');
const router = express.Router();
const { login, registrarUsuario, getUsuario, putPassword, deleteUsuario } = require('../controllers/auth.controller');
const { verificarToken, authorizeRole, authorizeUserAccess, verificarAdminEliminar, } = require('../middlewares/auth.middleware');

router.post('/login', login);
router.post('/register', verificarToken, authorizeRole(["gestionar_usuarios"]), registrarUsuario);
router.get('/get/:nombre_usuario', verificarToken, authorizeRole(["gestionar_usuarios"]), getUsuario);
router.put('/put/password/:nombre_usuario', verificarToken, authorizeUserAccess, putPassword);
router.delete('/delete/:nombre_usuario', verificarToken, authorizeRole(["gestionar_usuarios"]), verificarAdminEliminar, deleteUsuario);
module.exports = router;
