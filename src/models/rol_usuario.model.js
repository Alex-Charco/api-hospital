const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 

const RolUsuario = sequelize.define("RolUsuario", {
    id_rol: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_rol: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    permiso: {
        type: DataTypes.JSON,
        allowNull: false
    },
    estatus: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: "rol_usuario",
    timestamps: false 
});

module.exports = RolUsuario;
