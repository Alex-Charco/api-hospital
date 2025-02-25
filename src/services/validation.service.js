const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-+_#^(){}[\]]).{10,}$/;

function validarPassword(password) {
    return passwordRegex.test(password);
}

module.exports = { validarPassword };
