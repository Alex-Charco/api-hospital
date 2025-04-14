const pacienteService = require("../services/paciente.service");
const familiarService = require("../services/familiar.service");
const personaExternaService = require("../services/persona_externa.service");

async function obtenerDatosAutorizado(req, res) {
    try {
        const { tipo } = req.query;

        let resultado;
        if (tipo === "PACIENTE") {
            resultado = await pacienteService.obtenerPaciente(); 
        } else if (tipo === "FAMILIAR") {
            resultado = await familiarService.obtenerFamiliar(); 
        } else if (tipo === "EXTERNO") {
            resultado = await personaExternaService.obtenerExterno();
        }

        if (!resultado) {
            return res.status(404).json({ message: "No se encontraron datos" });
        }

        return res.json(resultado);
    } catch (error) {
        console.error("Error en obtenerDatosAutorizado:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
}

module.exports = {
    obtenerDatosAutorizado
};