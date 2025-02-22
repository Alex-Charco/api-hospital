const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Paciente = require('./pacienteModel');

const InfoMilitar = sequelize.define('InfoMilitar', {
    id_info_militar: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_paciente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Paciente,
            key: 'id_paciente'
        },
    },
    cargo: {
        type: DataTypes.ENUM(
            'NINGUNO', 'COMANDANTE', 'JEFE DE SECCIÓN', 'ENCARGADO DE LOGÍSTICA', 'DIRECTOR DE OPERACIONES',
            'MÉDICO', 'SOLDADO DE PRIMERA', 'OFICIAL DE ENLACE', 'SUBOFICIAL', 'TÉCNICO', 'COORDINADOR DE COMUNICACIONES',
            'ENCARGADO DE INTELIGENCIA', 'CAPITÁN DE FRAGATA', 'TENIENTE CORONEL'
        ),
        allowNull: false
    },
    grado: {
        type: DataTypes.ENUM(
            'GENERAL', 'CORONEL', 'MAYOR', 'CAPITÁN', 'TENIENTE', 'SUBTENIENTE',
            'SARGENTO', 'CABO', 'SOLDADO', 'OTRO'
        ),
        allowNull: false
    },
    fuerza: {
        type: DataTypes.ENUM('TERRESTRE', 'AÉREA', 'NAVAL'),
        allowNull: false
    },
    unidad: {
        type: DataTypes.ENUM('15-BAE'),
        allowNull: false
    }
}, {
    tableName: 'info_militar',
    timestamps: false
});

module.exports = InfoMilitar;