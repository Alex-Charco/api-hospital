function getEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    return edad;
}

function getGrupoEtario(edad) {
    if (edad >= 0 && edad <= 12) return 'Niño/a';
    if (edad >= 13 && edad <= 19) return 'Adolescente';
    if (edad >= 20 && edad <= 29) return 'Joven';
    if (edad >= 30 && edad <= 64) return 'Adulto';
    if (edad >= 65) return 'Adulto mayor';
    return 'Edad inválida';
}

module.exports = { getEdad, getGrupoEtario };
