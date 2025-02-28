const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 
const RolUsuario = require('./rol_usuario.model'); 

const Usuario = sequelize.define('Usuario', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: RolUsuario,
            key: 'id_rol'
        }
    },
    nombre_usuario: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    estatus: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: 'usuario', 
    timestamps: false 
});

module.exports = Usuario;
