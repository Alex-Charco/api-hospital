const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Usuario = require('./usuarioModel');
const Especialidad = require('./especialidadModel');

const Medico = sequelize.define('Medico', {
    id_medico: {
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
    id_especialidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Especialidad,
            key: 'id_especialidad'
        }
    },
    identificacion: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    fecha_nacimiento: {
        type: DataTypes.DATE,
        allowNull: false
    },
    primer_nombre: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    segundo_nombre: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    primer_apellido: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    segundo_apellido: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    genero: {
        type: DataTypes.ENUM('NINGUNO', 'MASCULINO', 'FEMENINO'),
        allowNull: false
    },
    reg_msp: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    celular: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    correo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    estatus: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: 'medico',
    timestamps: false
});

module.exports = Medico;
