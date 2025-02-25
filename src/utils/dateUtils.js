function formatFecha(fecha) {
    return new Date(fecha).toISOString().slice(0, 19).replace('T', ' ');
}

module.exports = { formatFecha };
