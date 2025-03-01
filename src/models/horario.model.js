const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Medico = require('./medico.model');

const Horario = sequelize.define('Horario', {
    id_horario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_medico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Medico,
            key: 'id_medico'
        }
    },
    institucion: {
        type: DataTypes.ENUM('C.S. A FM MAS', 'HB 17 PASTAZA', 'OTRO'),
        allowNull: false
    },
    fecha_horario: {
        type: DataTypes.DATE,
        allowNull: false
    },
    hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false
    },
    hora_fin: {
        type: DataTypes.TIME,
        allowNull: false
    },
    consulta_maxima: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    asignado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    seleccion: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0
    },
    turno_extra: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'horario',
    timestamps: false
});

module.exports = Horario;
