const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const personaAttributes = require('./personaAttributesModel');

const PersonaExterna = sequelize.define('PersonaExterna', {
    id_persona_externa: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ...personaAttributes,
    direccion: {
        type: DataTypes.STRING(250),
        allowNull: false
    }
}, {
    tableName: 'persona_externa',
    timestamps: false
});

module.exports = PersonaExterna;
