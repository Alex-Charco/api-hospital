const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Especialidad = sequelize.define('Especialidad', {
    id_especialidad: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.ENUM(
            'MEDICINA GENERAL',
            'GINECOLOGÍA',
            'MEDICINA INTERNA',
            'TRAUMATOLOGÍA',
            'CIRUGÍA GENERAL',
            'PSICOLOGÍA',
            'DERMATOLOGÍA',
            'ODONTOLOGÍA'
        ),
        allowNull: false
    },
    atencion: {
        type: DataTypes.ENUM(
            'CONSULTA EXTERNA'
        ),
        allowNull: false
    },
    consultorio: {
        type: DataTypes.ENUM(
            'CONSULTORIO 1 MEDICINA GENERAL',
            'CONSULTORIO 2 GINECOLOGÍA',
            'CONSULTORIO 3 MEDICINA INTERNA',
            'CONSULTORIO 4 TRAUMATOLOGÍA',
            'CONSULTORIO 5 CIRUGÍA GENERAL',
            'CONSULTORIO 6 PSICOLOGÍA',
            'CONSULTORIO 7 DERMATOLOGÍA',
            'CONSULTORIO 8 ODONTOLOGÍA'
        ),
        allowNull: false
    }
}, {
    tableName: 'especialidad',
    timestamps: false
});

module.exports = Especialidad;
