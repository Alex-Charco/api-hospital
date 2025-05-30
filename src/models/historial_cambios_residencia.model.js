const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HistorialCambiosResidencia = sequelize.define('HistorialCambiosResidencia', {
    id_historial_cambios_residencia: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_residencia: {
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
    tableName: 'historial_cambios_residencia',
    timestamps: false
});

module.exports = HistorialCambiosResidencia;
