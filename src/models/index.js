const sequelize = require("../config/db");

const Usuario = require("./usuarioModel");
const RolUsuario = require("./rolUsuarioModel");
const Persona = require("./personaModel");
const Paciente = require("./pacienteModel");
const InfoMilitar = require("./infoMilitarModel")
const Medico = require("./medicoModel")
const Especialidad = require("./especialidadModel")
const Administrador = require("./administradorModel");

// Definir relaciones con claves foráneas
RolUsuario.hasMany(Usuario, {
    foreignKey: "id_rol",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
});

Usuario.belongsTo(RolUsuario, {
    foreignKey: "id_rol",
    as: "rol",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
});

// Relación entre Paciente y Usuario
Usuario.hasOne(Paciente, {
    foreignKey: "id_usuario",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});


Paciente.belongsTo(Usuario, {
    foreignKey: "id_usuario",
    as: "usuario",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación entre Usuario y Médico
Usuario.hasOne(Medico, {
    foreignKey: "id_usuario",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Medico.belongsTo(Usuario, {
    foreignKey: "id_usuario",
    as: "usuario",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación entre Médico y Especialidad
Medico.belongsTo(Especialidad, {
    foreignKey: 'id_especialidad',
    as: 'especialidad'
});

Especialidad.hasMany(Medico, {
    foreignKey: 'id_especialidad',
    onDelete: 'RESTRICT', 
    onUpdate: 'CASCADE'
});

// Relación entre Usuario y Administrador
Usuario.hasOne(Administrador, {
    foreignKey: "id_usuario",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Administrador.belongsTo(Usuario, {
    foreignKey: "id_usuario",
    as: "usuario",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación entre Paciente e InfoMilitar
Paciente.hasOne(InfoMilitar, {
    foreignKey: "id_paciente",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

InfoMilitar.belongsTo(Paciente, {
    foreignKey: "id_paciente",
    as: "paciente",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Exportar modelos y conexión
module.exports = {
    sequelize,
    Usuario,
    RolUsuario,
    Persona,
    Paciente,
    InfoMilitar,
    Medico,
    Especialidad,
    Administrador
};
