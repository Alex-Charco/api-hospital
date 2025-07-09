const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Paciente = require('./paciente.model');

const Seguro = sequelize.define('Seguro', {
    id_seguro: {
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
        }
    },
    tipo: {
        type: DataTypes.ENUM('SEGURO ISSFA'),
        allowNull: false
    },
    beneficiario: {
        type: DataTypes.ENUM('MILITAR ACTIVO', 'MILITAR PASIVO'),
        allowNull: false
    },
    codigo: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    cobertura: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false
    },
    porcentaje: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false
    },
    fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fecha_fin: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'seguro',
    timestamps: false
});

module.exports = Seguro;
