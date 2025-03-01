// Formatea solo fecha y hora (Formato YYYY-MM-DD HH:MM:SS)
function formatFechaCompleta(fecha) {
    return new Date(fecha).toISOString().slice(0, 19).replace('T', ' '); 
}

// Formatea solo fecha (Formato YYYY-MM-DD)
function formatFecha(fecha) {
    return new Date(fecha).toISOString().split("T")[0]; 
}

// Función para formatear la hora
function formatHora(hora) {
    // Asegurarse de que la hora es válida y esté en formato correcto (ej: HH:mm:ss)
    return hora ? hora.toTimeString().split(' ')[0] : '';
}

module.exports = { formatFechaCompleta, formatFecha, formatHora };
