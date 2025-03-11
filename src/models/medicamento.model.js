const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Medicamento = sequelize.define("Medicamento", {
    id_medicamento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cum: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    nombre_medicamento: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    forma_farmaceutica: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    via_administracion: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    concentracion: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    presentacion: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM("AGUDO", "CRÓNICO", "PREVENTIVO"),
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "medicamento",
    timestamps: false
});

module.exports = Medicamento;
