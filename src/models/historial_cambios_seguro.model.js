const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

    const HistorialCambiosSeguro = sequelize.define('HistorialCambiosSeguro', {
        id_historial_cambios_seguro: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_seguro: {
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
            allowNull: true
        },
        fecha_cambio: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'historial_cambios_seguro',
        timestamps: false
    });

 module.exports = HistorialCambiosSeguro;
