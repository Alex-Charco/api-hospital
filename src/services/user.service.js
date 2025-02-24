const { Paciente, Medico, Administrador } = require('../models');

async function verificarAsignaciones(id_usuario) {
    const paciente = await Paciente.findOne({ where: { id_usuario } });
    const medico = await Medico.findOne({ where: { id_usuario } });
    const administrador = await Administrador.findOne({ where: { id_usuario } });

    return !!(paciente || medico || administrador);
}

module.exports = {
    verificarAsignaciones
};
