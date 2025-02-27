const { DataTypes } = require('sequelize');

const personaAttributes = {
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
};

module.exports = personaAttributes;