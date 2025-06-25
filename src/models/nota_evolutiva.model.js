const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Cita = require('./cita.model');

const NotaEvolutiva = sequelize.define('NotaEvolutiva', {
    id_nota_evolutiva: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_cita: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cita,
            key: 'id_cita'
        }
    },
    motivo_consulta: {
        type: DataTypes.STRING(966),
        allowNull: false
    },
    enfermedad: {
        type: DataTypes.STRING(979),
        allowNull: false
    },
    tratamiento: {
        type: DataTypes.STRING(949),
        allowNull: false
    },
    resultado_examen: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    decision_consulta: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    reporte_decision: {
        type: DataTypes.TEXT,
        allowNull: false
    },
	fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'nota_evolutiva',
    timestamps: false
});

module.exports = NotaEvolutiva;