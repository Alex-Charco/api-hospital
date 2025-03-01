const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Horario = require('./horario.model');

const Turno = sequelize.define('Turno', {
    id_turno: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_horario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Horario,  
            key: 'id_horario'
        }
    },
    numero_turno: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    hora_turno: {
        type: DataTypes.TIME,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('DISPONIBLE', 'RESERVADO'),
        allowNull: false
    }
}, {
    tableName: 'turno',
    timestamps: false
});

module.exports = Turno;
