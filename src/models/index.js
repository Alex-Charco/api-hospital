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
const NotaEvolutiva = require("./nota_evolutiva.model");
const Diagnostico = require("./diagnostico.model");
const Procedimiento = require("./procedimiento.model");
const Link = require("./link.model");
const Receta = require("./receta.model");
const Medicacion = require("./medicacion.model");
const Medicamento = require("./medicamento.model");
const Posologia = require("./posologia.model");
const RecetaAutorizacion = require("./receta_autorizacion.model");
const Asistencia = require("./asistencia.model");
const PersonaExterna = require("./persona_externa.model");

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
    as: 'residencia',
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Residencia.belongsTo(Paciente, {
    foreignKey: "id_paciente",
    as: "residencia",
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

// Relación entre NotaEvolutiva y Cita
Cita.hasMany(NotaEvolutiva, {
    foreignKey: "id_cita",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

NotaEvolutiva.belongsTo(Cita, {
    foreignKey: "id_cita",
    as: "cita",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación entre Diagnostico y NotaEvolutiva
NotaEvolutiva.hasMany(Diagnostico, {
    foreignKey: "id_nota_evolutiva",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Diagnostico.belongsTo(NotaEvolutiva, {
    foreignKey: "id_nota_evolutiva",
    as: "Diagnosticos",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación entre Procedimiento y Diagnóstico
Diagnostico.hasMany(Procedimiento, {
    foreignKey: "id_diagnostico",
	as: "Procedimientos",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Procedimiento.belongsTo(Diagnostico, {
    foreignKey: "id_diagnostico",
    as: "diagnostico",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación: Una NotaEvolutiva puede tener varios Links
NotaEvolutiva.hasMany(Link, {
    foreignKey: "id_nota_evolutiva",
    as: "links",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación inversa: Un Link pertenece a una NotaEvolutiva
Link.belongsTo(NotaEvolutiva, {
    foreignKey: "id_nota_evolutiva",
    as: "notaEvolutiva",
	onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación: Una NotaEvolutiva puede tener varias Recetas
NotaEvolutiva.hasMany(Receta, {
    foreignKey: "id_nota_evolutiva",
    as: "recetas",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación inversa: Una Receta pertenece a una NotaEvolutiva
Receta.belongsTo(NotaEvolutiva, {
    foreignKey: "id_nota_evolutiva",
    as: "notasEvolutivas",
	onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación: Una Receta puede tener varias Medicaciones
Receta.hasMany(Medicacion, {
    foreignKey: "id_receta",
    as: "medicaciones",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación inversa: Una Medicación pertenece a una Receta
Medicacion.belongsTo(Receta, {
    foreignKey: "id_receta",
    as: "receta",
	onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación: Un Medicamento puede estar en varias Medicaciones
Medicamento.hasMany(Medicacion, {
    foreignKey: "id_medicamento",
    as: "medicaciones",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación inversa: Una Medicación pertenece a un Medicamento
Medicacion.belongsTo(Medicamento, {
    foreignKey: "id_medicamento",
    as: "medicamento",
	onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación: Una Medicación puede tener varias Posologías
Medicacion.hasMany(Posologia, {
    foreignKey: "id_medicacion",
    as: "posologias",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
})

Posologia.belongsTo(Medicacion, {
    foreignKey: "id_medicacion",
    as: "posologias",
	onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación: Una Receta puede tener múltiples Autorizaciones
Receta.hasOne(RecetaAutorizacion, { 
    as: 'receta_autorizacion', 
    foreignKey: 'id_receta',
	onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación inversa: Una Autorización pertenece a una única Receta
RecetaAutorizacion.belongsTo(Receta, {
    foreignKey: "id_receta",
    as: "receta",
	onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación con Paciente (si el autorizado es el paciente)
Paciente.hasMany(RecetaAutorizacion, {
    foreignKey: "id_paciente",
    as: "autorizaciones_paciente",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
RecetaAutorizacion.belongsTo(Paciente, {
    foreignKey: "id_paciente",
    as: "paciente",
	onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación con Familiar (si el autorizado es un familiar)
Familiar.hasMany(RecetaAutorizacion, {
    foreignKey: "id_familiar",
    as: "autorizaciones_familiar",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
RecetaAutorizacion.belongsTo(Familiar, {
    foreignKey: "id_familiar",
    as: "familiar",
	onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación con Persona Externa (si el autorizado es un externo)
PersonaExterna.hasMany(RecetaAutorizacion, {
    foreignKey: "id_persona_externa",
    as: "autorizaciones_externo",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
RecetaAutorizacion.belongsTo(PersonaExterna, {
    foreignKey: "id_persona_externa",
    as: "persona_externa",
	onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación: Una Cita puede tener una Asistencia
Cita.hasOne(Asistencia, {
    foreignKey: "id_cita",
    as: "asistencia",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación inversa: Una Asistencia pertenece a una Cita
Asistencia.belongsTo(Cita, {
    foreignKey: "id_cita",
    as: "cita",
	onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Exportar Cita en el módulo
/*module.exports = {
    ...module.exports,
    Cita
};*/

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
    Cita,
	NotaEvolutiva,
	Diagnostico,
	Procedimiento,
	Link, 
	Receta,
	Medicacion,
	Medicamento,
	Posologia,
    PersonaExterna,
	RecetaAutorizacion
};
