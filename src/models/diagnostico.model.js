const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const NotaEvolutiva = require('./nota_evolutiva.model');

const Diagnostico = sequelize.define('Diagnostico', {
    id_diagnostico: {
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
        }
    },
    condicion: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    cie_10: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING(250),
        allowNull: true
    }
}, {
    tableName: 'diagnostico',
    timestamps: false
});

module.exports = Diagnostico;
