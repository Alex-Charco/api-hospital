const errorMessages = {
    // Mensajes de error del usuario authcontroller
    usuarioNoEncontrado: "Usuario no encontrado",
    usuarioInactivo: "Usuario está inactivo",
    usuarioSinRol: "Error: El usuario no tiene un rol asignado",
    usuarioYaExiste: "El nombre de usuario ya está en uso",
    passwordInsegura: "La contraseña no es segura. Debe tener al menos 10 caracteres, una mayúscula, un número y un carácter especial (@$!%*?&-+).",
    passwordIncorrecta: "Contraseña incorrecta",
    passwordActualIncorrecta: "Contraseña actual incorrecta",
    passwordNoDisponible: "Contraseña no disponible en la base de datos",
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
    accesoNoPermitido: "No tienes permiso para acceder a este usuario"
};

module.exports = errorMessages;
