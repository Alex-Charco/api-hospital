const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Usuario = require('./usuario.model');
const personaAttributes = require('./persona_attributes');

const Paciente = sequelize.define('Paciente', {
        id_paciente: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Usuario,
                key: 'id_usuario'
            }
        },
        ...personaAttributes,
        estado_civil: {
            type: DataTypes.ENUM('SOLTERO/A', 'CASADO/A', 'DIVORCIADO/A', 'VIUDO/A', 'OTRO'),
            allowNull: false
        },
        grupo_sanguineo: {
            type: DataTypes.ENUM('NINGUNO', 'A RH+', 'A RH-', 'B RH+', 'B RH-', 'AB RH+', 'AB RH-', 'O RH+', 'O RH-'),
            allowNull: false
        },
        instruccion: {
            type: DataTypes.ENUM('BÁSICA', 'BACHILLERATO', 'SUPERIOR'),
            allowNull: false
        },
        ocupacion: {
            type: DataTypes.ENUM('ABOGADO', 'AGRICULTOR', 'AMA DE CASA', 'BOMBERO', 'COMERCIANTE', 'CONTADOR', 'DESEMPLEADO', 'DOCENTE', 'EMPLEADO PRIVADO', 'EMPLEADO PÚBLICO', 'EMPRESARIO', 'ESTUDIANTE', 'INGENIERO', 'JUBILADO', 'MÉDICO', 'MILITAR', 'OBRERO', 'POLICÍA', 'INDEPENDIENTE', 'TÉCNICO'),
            allowNull: false
        },
        empresa: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        discapacidad: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        orientacion: {
            type: DataTypes.ENUM('NINGUNO', 'HETEROSEXUAL', 'HOMOSEXUAL', 'OTRO'),
            allowNull: false
        },
        identidad: {
            type: DataTypes.ENUM('NINGUNO', 'CISGÉNERO', 'BINARIO', 'NO BINARIO', 'INTERSEXUAL', 'TRANSEXUAL', 'TRANSGÉNERO'),
            allowNull: false
        },
        tipo_paciente: {
            type: DataTypes.ENUM('CIVIL', 'MILITAR'),
            allowNull: false
        },
}, {
    tableName: 'paciente',
    timestamps: false
});

module.exports = Paciente;