const sequelize = require("../config/db");

const Usuario = require("./usuario.model");
const RolUsuario = require("./rol_usuario.model");
const Persona = require("./persona.model");
const Paciente = require("./paciente.model");
const InfoMilitar = require("./info_militar.model")
const Medico = require("./medico.model")
const Especialidad = require("./especialidad.model")
const Administrador = require("./administrador.model");
const Familiar = require("./familiar.model");
const Residencia = require("./residencia.model");
const Seguro = require("./seguro.model");
const Horario = require("./horario.model");
const Turno = require("./turno.model");
const Cita = require("./cita.model");

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

// Relación entre Paciente y Seguro (Un Paciente tiene un Seguro)
Paciente.hasOne(Seguro, {
    foreignKey: 'id_paciente',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Seguro.belongsTo(Paciente, {
    foreignKey: 'id_paciente',
    as: 'paciente',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Relación entre médico y horario
Medico.hasMany(Horario, {
    foreignKey: 'id_medico',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Horario.belongsTo(Medico, {
    foreignKey: 'id_medico',
    as: 'medico',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Relación entre Turno y Horario (un horario puede tener muchos turnos)
Horario.hasMany(Turno, {
    foreignKey: 'id_horario',
    as: 'turnos', 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Turno.belongsTo(Horario, {
    foreignKey: 'id_horario',
    as: 'horario',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Relación entre Cita y Paciente
Paciente.hasMany(Cita, {
    foreignKey: "id_paciente",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Cita.belongsTo(Paciente, {
    foreignKey: "id_paciente",
    as: "paciente",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación entre Cita y Turno
Turno.hasMany(Cita, {
    foreignKey: "id_turno",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Cita.belongsTo(Turno, {
    foreignKey: "id_turno",
    as: "turno",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Exportar Cita en el módulo
module.exports = {
    ...module.exports,
    Cita
};

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
    Residencia,
    Seguro,
    Horario,
    Turno,
    Cita
};
