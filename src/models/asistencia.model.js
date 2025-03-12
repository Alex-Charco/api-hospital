const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Asistencia = sequelize.define("Asistencia", {
    id_asistencia: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_cita: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha_asistencia: {
        type: DataTypes.DATE,
        allowNull: false
    },
    estado_asistencia: {
        type: DataTypes.ENUM("CONFIRMADA", "CANCELADA", "REAGENDADA", "NO_ASISTIO"),
        allowNull: false
    },
    comentario: {
        type: DataTypes.STRING(600),
        allowNull: true
    }
}, {
    tableName: "asistencia",
    timestamps: false
});

module.exports = Asistencia;
