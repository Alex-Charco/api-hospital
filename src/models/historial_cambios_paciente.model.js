const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HistorialCambiosPaciente = sequelize.define('HistorialCambiosPaciente', {
    id_historial_cambios_paciente: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_paciente: {
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
    tableName: 'historial_cambios_paciente',
    timestamps: false
});

module.exports = HistorialCambiosPaciente;
