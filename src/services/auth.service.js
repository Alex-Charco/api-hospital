const jwt = require('jsonwebtoken');

function generarToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10h' });
}

module.exports = { generarToken };
