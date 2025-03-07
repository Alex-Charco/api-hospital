const express = require('express');
const router = express.Router();
const { getTurnos } = require('../controllers/turno.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

// Ruta única para obtener turnos con filtros opcionales
router.get("/get", verificarToken, authorizeRole(["ver_turno"]), getTurnos);

module.exports = router;



/*const express = require('express');
const router = express.Router();
const { getTurnosDisponibles, getTurnosPorFecha  } = require('../controllers/turno.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

router.get("/get/disponibles", verificarToken, authorizeRole(["ver_turno"]), getTurnosDisponibles);
router.get("/get/fecha/:fecha", verificarToken, authorizeRole(["ver_turno"]), getTurnosPorFecha);

module.exports = router;

*/
/*
const express = require('express');
const router = express.Router();
const { getTurnos } = require('../controllers/turno.controller');
const { verificarToken, authorizeRole } = require('../middlewares/auth.middleware');

router.get("/get/disponibles", verificarToken, authorizeRole(["ver_turno"]), getTurnos);
router.get("/get/fecha/:fecha", verificarToken, authorizeRole(["ver_turno"]), getTurnos);

module.exports = router;
 */
