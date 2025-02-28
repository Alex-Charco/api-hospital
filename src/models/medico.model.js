const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Usuario = require('./usuario.model');
const Especialidad = require('./especialidad.model');
const personaAttributes = require('./persona_attributes');

const Medico = sequelize.define('Medico', {
    id_medico: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id_usuario'
        }
    },
    id_especialidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Especialidad,
            key: 'id_especialidad'
        }
    },
    ...personaAttributes,
    reg_msp: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'medico',
    timestamps: false
});

module.exports = Medico;