const { Model } = require('sequelize');
const sequelize = require('../config/db');
const personaAttributes = require('./persona_attributes');

class Persona extends Model {}

Persona.init(personaAttributes, {
    sequelize,
    modelName: "Persona",
    tableName: 'persona',
    timestamps: false
});

module.exports = Persona;
