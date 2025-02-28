const sequelize = require("../config/db");

const Usuario = require("./usuario.model");
const RolUsuario = require("./rol_usuario.model");
const Persona = require("./persona.model");
const Paciente = require("./paciente.nodel");
const InfoMilitar = require("./info_militar.model")
const Medico = require("./medico.model")
const Especialidad = require("./especialidad.model")
const Administrador = require("./administrador.model");
const Familiar = require("./familiar.model");
const Residencia = require("./residencia.model");

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

// Relación entre Paciente y Familiar
Paciente.hasMany(Familiar, {
    foreignKey: "id_paciente",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Familiar.belongsTo(Paciente, {
    foreignKey: "id_paciente",
    as: "paciente",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación entre Paciente y Residencia
Paciente.hasOne(Residencia, {
    foreignKey: "id_paciente",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Residencia.belongsTo(Paciente, {
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
    Administrador,
    Familiar,
    Residencia
};
