const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Paciente = require('./paciente.model');
const Turno = require('./turno.model');

const Cita = sequelize.define('Cita', {
    id_cita: {
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
    id_turno: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Turno,
            key: 'id_turno'
        }
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    estado_cita: {
        type: DataTypes.ENUM('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'REAGENDADA', 'NO_ASISTIO'),
        allowNull: false,
        defaultValue: 'PENDIENTE'
    }
}, {
    tableName: 'cita',
    timestamps: false
});

module.exports = Cita;
