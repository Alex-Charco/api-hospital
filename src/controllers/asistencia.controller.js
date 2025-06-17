const asistenciaService = require('../services/asistencia.service');
const { formatCompleta } = require('../utils/date_utils');

const getAsistenciaByCita = async (req, res) => {
    try {
        const { id_cita } = req.params;
        const asistencia = await asistenciaService.findByCitaId(id_cita);
        if (!asistencia) {
            return res.status(404).json({ message: 'Asistencia no encontrada para esta cita' });
        }

        const asistenciaJSON = asistencia.toJSON();

        // Formatea fecha_asistencia
        asistenciaJSON.fecha_asistencia = formatCompleta(asistenciaJSON.fecha_asistencia);

        // Formatea fecha_creacion dentro de cita si existe
        if (asistenciaJSON.cita && asistenciaJSON.cita.fecha_creacion) {
            asistenciaJSON.cita.fecha_creacion = formatCompleta(asistenciaJSON.cita.fecha_creacion);
        }

        res.json(asistenciaJSON);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la asistencia', error });
    }
};

const createAsistencia = async (req, res) => {
    try {
        const { id_cita, estado_asistencia, comentario } = req.body;

        // Validación básica
        if (!id_cita || !estado_asistencia) {
            return res.status(400).json({ message: 'Campos obligatorios faltantes' });
        }

        const asistencia = await asistenciaService.crearAsistencia({
            id_cita,
            estado_asistencia,
            comentario,
        });

        const asistenciaJSON = asistencia.toJSON();
        asistenciaJSON.fecha_asistencia = formatCompleta(asistenciaJSON.fecha_asistencia); // se formatea si ya viene del modelo

        res.status(201).json(asistenciaJSON);
    } catch (error) {
        console.error('Error al crear la asistencia:', error);
        res.status(500).json({ message: 'Error al registrar la asistencia', error: error.message });
    }
};

module.exports = {
    getAsistenciaByCita,
	createAsistencia
};
