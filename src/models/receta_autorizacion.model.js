const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RecetaAutorizacion = sequelize.define("RecetaAutorizacion", {
    id_receta_autorizacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_receta: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_paciente: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    id_familiar: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    id_persona_externa: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tipo_autorizado: {
        type: DataTypes.ENUM("PACIENTE", "FAMILIAR", "EXTERNO"),
        allowNull: false
    }
}, {
    tableName: "receta_autorizacion",
    timestamps: false
});

module.exports = RecetaAutorizacion;
