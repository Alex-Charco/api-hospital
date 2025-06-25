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

// Formatea solo fecha y hora (Formato YYYY-MM-DD HH:MM:SS)
function formatCompleta(fecha) {
    const date = new Date(fecha);
    
    // Ajusta la fecha a la zona horaria "America/Bogota" manualmente
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Asegurarse que el mes tenga dos dígitos
    const day = String(date.getDate()).padStart(2, '0');         // Asegurarse que el día tenga dos dígitos
    const hours = String(date.getHours()).padStart(2, '0');       // Asegurarse que la hora tenga dos dígitos
    const minutes = String(date.getMinutes()).padStart(2, '0');   // Asegurarse que los minutos tengan dos dígitos
    const seconds = String(date.getSeconds()).padStart(2, '0');   // Asegurarse que los segundos tengan dos dígitos
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Formatea fecha completa en formato YYYY-MM-DD HH:MM:SS (hora local)
function formatFechaCompletaLocal(fecha) {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
module.exports = { 
	formatFechaCompleta, 
	formatFecha, 
	formatHora, 
	formatCompleta,
	formatFechaCompletaLocal
};
