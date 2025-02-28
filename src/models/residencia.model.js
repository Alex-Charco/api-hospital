const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Paciente = require('./paciente.nodel');

const Residencia = sequelize.define('Residencia', {
    id_residencia: {
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
    lugar_nacimiento: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    pais: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    nacionalidad: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    provincia: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    canton: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    parroquia: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    direccion: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    fecha_registro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'residencia',
    timestamps: false
});

module.exports = Residencia;
