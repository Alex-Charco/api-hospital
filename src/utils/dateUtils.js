// Formatea solo fecha y hora (Formato YYYY-MM-DD HH:MM:SS)
function formatFecha(fecha) {
    return new Date(fecha).toISOString().slice(0, 19).replace('T', ' '); 
}

// Formatea solo fecha (Formato YYYY-MM-DD)
function formatFechaNacimiento(fecha) {
    return new Date(fecha).toISOString().split("T")[0]; 
}

module.exports = { formatFecha, formatFechaNacimiento };
