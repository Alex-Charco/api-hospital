const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Receta = require("./receta.model");
const Medicamento = require("./medicamento.model");

const Medicacion = sequelize.define("Medicacion", {
    id_medicacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_receta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Receta,
            key: "id_receta"
        },
    },
    id_medicamento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Medicamento,
            key: "id_medicamento"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    externo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    indicacion: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    signo_alarma: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    indicacion_no_farmacologica: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    recomendacion_no_farmacologica: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: "medicacion",
    timestamps: false
});

module.exports = Medicacion;
