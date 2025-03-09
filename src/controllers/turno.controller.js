const turnoService = require("../services/turno.service");
const errorMessages = require("../utils/error_messages");

// Obtener turnos con filtros opcionales
async function getTurnos(req, res) {
    try {
        const { fecha, estado, fechaInicio, fechaFin } = req.query; // Se agregan nuevos filtros
        const turnos = await turnoService.obtenerTurnos({ fecha, estado, fechaInicio, fechaFin });

        if (turnos.message) {
            return res.status(404).json({ message: turnos.message, turnos: turnos.turnos });
        }

        return res.status(200).json(turnos);
    } catch (error) {
        console.error("❌ Error en getTurnos:", error.message);
        return res.status(500).json({ message: error.message || errorMessages.errorServidor });
    }
}

module.exports = { getTurnos };
