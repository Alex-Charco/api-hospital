const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Posologia = sequelize.define("Posologia", {
    id_posologia: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_medicacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dosis_numero: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dosis_tipo: {
        type: DataTypes.ENUM("AMPOLLA", "CAPSULA", "CUCHARADA", "GOTAS", "GOTERO", "GRAGEA", "INYECCIÓN", "MILILITRO", "PARCHES", "SOBRE", "SUPOSITORIO", "TABLETA", "UNIDAD"),
        allowNull: false
    },
    frecuencia_numero: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    frecuencia_tipo: {
        type: DataTypes.ENUM("HORAS", "DÍAS", "SEMANAS"),
        allowNull: false
    },
    duracion_numero: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    duracion_tipo: {
        type: DataTypes.ENUM("HORAS", "DÍAS", "SEMANAS", "MES", "AÑO"),
        allowNull: false
    },
    fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false
    },
    via: {
        type: DataTypes.ENUM("ORAL", "INTRAVENOSA", "INTRAMUSCULAR", "SUBCUTÁNEA"),
        allowNull: false
    },
    calcular: {
        type: DataTypes.STRING(300),
        allowNull: true
    }
}, {
    tableName: "posologia",
    timestamps: false
});

module.exports = Posologia;
