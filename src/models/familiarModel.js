const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Paciente = require('./pacienteModel');
const personaAttributes = require('./personaAttributes');

const Familiar = sequelize.define('Familiar', {
    id_familiar: {
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
    ...personaAttributes,
    relacion: {
        type: DataTypes.ENUM('ABUELO/A', 'PADRE', 'MADRE', 'ESPOSO/A', 'HERMANO/A', 'PRIMO/A', 'TÍO/A'),
        allowNull: false
    },
    direccion: {
        type: DataTypes.STRING(250),
        allowNull: false
    }
}, {
    tableName: 'familiar',
    timestamps: false
});

module.exports = Familiar;
