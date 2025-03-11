const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Diagnostico = require('./diagnostico.model');

const Procedimiento = sequelize.define('Procedimiento', {
    id_procedimiento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_diagnostico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Diagnostico,
            key: 'id_diagnostico'
        }
    },
    codigo: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    descripcion_proc: {
        type: DataTypes.STRING(250),
        allowNull: true
    }
}, {
    tableName: 'procedimiento',
    timestamps: false
});

module.exports = Procedimiento;
