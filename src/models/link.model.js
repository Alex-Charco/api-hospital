const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const NotaEvolutiva = require("./nota_evolutiva.model");

const Link = sequelize.define("Link", {
    id_link: {
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
    categoria: {
        type: DataTypes.ENUM("EXAMEN", "PEDIDO", "CERTIFICADO", "OTRO", "TRANSFERIR"),
        allowNull: false
    },
	nombre_documento: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    url: {
        type: DataTypes.STRING(300),
        allowNull: false
    },
	descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: "link",
    timestamps: false
});

module.exports = Link;
