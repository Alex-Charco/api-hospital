const sequelize = require("../config/db");

const Usuario = require("./usuarioModel");
const RolUsuario = require("./rolUsuarioModel");

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
};
