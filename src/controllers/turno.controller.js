const turnoService = require("../services/turno.service");
const errorMessages = require("../utils/error_messages");

// Obtener turnos con filtros opcionales
async function getTurnos(req, res) {
    try {
        const { fecha, estado } = req.query; // Obtenemos los parámetros opcionales desde la URL
        const turnos = await turnoService.obtenerTurnos({ fecha, estado });
        return res.status(200).json(turnos);
    } catch (error) {
        console.error("❌ Error en getTurnos:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = { getTurnos };






/*const turnoService = require("../services/turno.service");
const errorMessages = require("../utils/error_messages");

// Obtener turnos disponibles (general o por fecha)
async function getTurnos(req, res) {
    const { fecha } = req.params; // Parámetro opcional
    
    if (!fecha) {
        return res.status(400).json({ message: "Se requiere una fecha válida." });
    }

    console.log("📅 Fecha recibida en el controlador:", fecha); // Verificar la fecha recibida

    try {
        const turnos = await turnoService.obtenerTurnos({ fecha });
        return res.status(200).json(turnos);
    } catch (error) {
        console.error("❌ Error en getTurnos:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = { getTurnos };
*/

// ** Si funciona
/*const turnoService = require("../services/turno.service");
const errorMessages = require("../utils/error_messages");

//este funcina
// Obtener todos los turnos disponibles desde la fecha actual
async function getTurnosDisponibles(req, res) {
    try {
        const turnos = await turnoService.obtenerTurnosDisponibles();
        return res.status(200).json(turnos);
    } catch (error) {
        console.error("❌ Error en getTurnosDisponibles:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

// Obtener turnos disponibles por fecha seleccionada
async function getTurnosPorFecha(req, res) {
    let { fecha } = req.params;

    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({ message: "Se requiere una fecha válida en formato YYYY-MM-DD." });
    }

    try {
        const turnos = await turnoService.obtenerTurnosPorFecha(fecha);
        return res.status(200).json(turnos);
    } catch (error) {
        console.error("❌ Error en getTurnosPorFecha:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}


module.exports = { getTurnosDisponibles, getTurnosPorFecha };
*/