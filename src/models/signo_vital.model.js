const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const NotaEvolutiva = require('./nota_evolutiva.model');

const SignoVital = sequelize.define('SignoVital', {
    id_signo_vital: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_nota_evolutiva: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: NotaEvolutiva,
            key: 'id_nota_evolutiva'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    fecha_registro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    presion_arterial_sistolica: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    presion_arterial_diastolica: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    frecuencia_cardiaca: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    frecuencia_respiratoria: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    temperatura: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true
    },
    saturacion_oxigeno: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    peso: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    talla: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'signo_vital',
    timestamps: false
});

module.exports = SignoVital;
