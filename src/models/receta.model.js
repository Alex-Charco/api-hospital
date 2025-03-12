const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const NotaEvolutiva = require("./nota_evolutiva.model");

const Receta = sequelize.define("Receta", {
    id_receta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_nota_evolutiva: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: NotaEvolutiva,
            key: "id_nota_evolutiva"
        },
    },
    fecha_prescripcion: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fecha_vigencia: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: "receta",
    timestamps: false
});

module.exports = Receta;
