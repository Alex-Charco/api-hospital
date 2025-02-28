const errorMessages = {
    // Mensajes de error del usuario authcontroller
    usuarioNoEncontrado: "Usuario no encontrado",
    usuarioInactivo: "Usuario está inactivo",
    usuarioSinRol: "Error: El usuario no tiene un rol asignado",
    usuarioYaExiste: "El nombre de usuario ya está en uso",
    passwordInsegura: process.env.PASSWORD_INSEGURA_MSG,
    passwordIncorrecta:  process.env.PASSWORD_INCORRECTA_MSG,
    passwordActualIncorrecta: process.env.PASSWORD_ACTUAL_INCORRECTA_MSG,
    passwordNoDisponible: process.env.PASSWORD_NO_DISPONIBLE,
    noEliminarAdmin: "No puedes eliminar a otro administrador",
    usuarioAsignado: "No se puede eliminar el usuario porque está asignado a una entidad",
    


    // Mensajes generales
    errorServidor: "Error en el servidor",

    // Mensajes para el middleware de autenticación
    tokenNoProporcionado: "No autorizado. Token no proporcionado.",
    rolNoDefinido: "Rol no definido en el token.",
    rolNoValido: "Rol no válido o desactivado.",
    tokenExpirado: "El token ha expirado. Por favor, inicia sesión nuevamente.",
    tokenInvalido: "Token inválido.",
    permisosInsuficientes: "No tienes permisos para realizar esta acción",
    accesoNoPermitido: "No tienes permiso para acceder a este usuario",

    // Mensajes para paciente
    pacienteNoEncontrado: "Paciente no encontrado.",
    faltanDatos: "Faltan datos obligatorios.",
    formatoFechaIncorrecto: "Formato de fecha incorrecto.",
    pacienteEncontrado: "Paciente encontrado",

    // Mensajes para paciente service
    usuarioNoExistente: "El usuario ingresado no existe.",
    usuarioNoEsPaciente: "El usuario no tiene el rol de PACIENTE.",
    usuarioRegistradoPaciente: "Este usuario ya está registrado como paciente.",
    pacinteYaRegistrado: "Ya existe un paciente con esta identificación.",

    // Mensajes de infoMilitar
    pacienteMilitar: "Solo los pacientes MILITARES pueden registrar información militar.",
    infoMilitarRegistrada: "El paciente ya tiene información militar registrada.",
    infoMilitarNoEncontrada: "Información militar no encontrada.",
    errorValidarPaciente: "Error al validar el paciente",

    // Mensajes de familiar
    familiarRegistrado:  "El paciente ya tiene familia registrado.",
    familiarNoEncontrado: "Familiar no encontrado",
    errorCrearFamiliar: "Error al crear el familiar: ",
    errorActualizarFamiliar: "Error al actualizar los datos del familiar: ",
    noInfoIdentificacion: "No se encontró información para la identificación proporcionada.",

};

module.exports = errorMessages;
