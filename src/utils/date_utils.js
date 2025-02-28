// Formatea solo fecha y hora (Formato YYYY-MM-DD HH:MM:SS)
function formatFechaCompleta(fecha) {
    return new Date(fecha).toISOString().slice(0, 19).replace('T', ' '); 
}

// Formatea solo fecha (Formato YYYY-MM-DD)
function formatFecha(fecha) {
    return new Date(fecha).toISOString().split("T")[0]; 
}

module.exports = { formatFechaCompleta, formatFecha };
