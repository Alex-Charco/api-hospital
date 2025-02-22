const { InfoMilitar, Paciente } = require('../models');

module.exports = {
    // Crear nuevo registro de información militar (solo administradores)
    async registrarInfoMilitar(req, res) {
        const { identificacion, cargo, grado, fuerza, unidad } = req.body;

        try {
            // ✅ Verificar si el usuario logueado tiene el rol de ADMINISTRADOR
            const usuarioLogueado = req.usuario;
            if (!usuarioLogueado || usuarioLogueado.rol.nombre_rol !== 'ADMINISTRADOR') {
                return res.status(403).json({ message: "No tienes permisos para registrar información militar." });
            }

            // ✅ Verificar si el paciente existe por número de identificación
            const paciente = await Paciente.findOne({ where: { identificacion } });
            
            if (!paciente) {
                return res.status(404).json({ message: "Paciente no encontrado." });
            }

            // ✅ Verificar si el paciente es de tipo "militar"
            if (paciente.tipo_paciente !== 'MILITAR') {
                return res.status(400).json({ message: "Solo los pacientes MILITARES pueden registrar información militar." });
            }

            // ✅ Verificar si ya existe información militar para este paciente
            const existeInfoMilitar = await InfoMilitar.findOne({ where: { id_paciente: paciente.id_paciente } });
            if (existeInfoMilitar) {
                return res.status(409).json({ message: "El paciente ya tiene información militar registrada." });
            }

            // ✅ Crear nueva información militar
            const infoMilitar = await InfoMilitar.create({
                id_paciente: paciente.id_paciente,
                cargo,
                grado,
                fuerza,
                unidad,
            });

            return res.status(201).json({
                message: "Información militar registrada exitosamente.",
                infoMilitar
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error al crear información militar." });
        }
    },
};
