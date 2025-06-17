const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HistorialCambiosInfoMilitar = sequelize.define('HistorialCambiosInfoMilitar', {
    id_historial_cambios_info_militar: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_info_militar: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    campo_modificado: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    valor_anterior: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    valor_nuevo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fecha_cambio: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'historial_cambios_info_militar',
    timestamps: false
});

module.exports = HistorialCambiosInfoMilitar;
