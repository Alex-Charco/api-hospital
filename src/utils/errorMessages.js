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
    pacienteRegistrado: "Paciente registrado exitosamente.",
    pacienteEncontrado: "Paciente encontrado",
    informacionPaciente: "Información del paciente actualizada exitosamente",

    // Mensajes para paciente service
    usuarioNoExistente: "El usuario ingresado no existe.",
    usuarioNoEsPaciente: "El usuario no tiene el rol de PACIENTE.",
    usuarioRegistradoPaciente: "Este usuario ya está registrado como paciente.",
    pacinteYaRegistrado: "Ya existe un paciente con esta identificación.",
};

module.exports = errorMessages;
