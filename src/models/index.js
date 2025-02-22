const sequelize = require("../config/db");

const Usuario = require("./usuarioModel");
const RolUsuario = require("./rolUsuarioModel");
const Paciente = require("./pacienteModel");

// Definir relaciones con claves foráneas
RolUsuario.hasMany(Usuario, {
    foreignKey: "id_rol",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
});

Usuario.belongsTo(RolUsuario, {
    foreignKey: "id_rol",
    as: "rol",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
});

// Relación entre Paciente y Usuario
Usuario.hasOne(Paciente, {
    foreignKey: "id_usuario",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Paciente.belongsTo(Usuario, {
    foreignKey: "id_usuario",
    as: "usuario",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Función para sincronizar modelos
async function syncModels() {
    try {
        console.log('Sincronizando modelos con la base de datos...');
        await sequelize.sync({ alter: true });
        console.log('Sincronización completada.');
    } catch (error) {
        console.error('Error al sincronizar los modelos:', error);
    }
}

syncModels();

// Exportar modelos y conexión
module.exports = {
    sequelize,
    Usuario,
    RolUsuario,
    Paciente,
};
