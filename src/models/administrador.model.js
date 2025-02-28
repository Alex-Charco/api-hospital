const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Usuario = require('./usuario.model');
const personaAttributes = require('./persona_attributes');


const Administrador = sequelize.define('Administrador', {
    id_admin: {
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
    ...personaAttributes,
}, {
    tableName: 'administrador',
    timestamps: false
});

module.exports = Administrador;