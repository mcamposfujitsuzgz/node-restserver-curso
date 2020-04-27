const jwt = require('jsonwebtoken');

// verificacion Token
let verificaToken = (req, res, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        res.usuario = decoded.usuario;

        next();
    });
};


let verificaAdminRol = (req, res, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
        let usuario = res.usuario;

        if (usuario.role === 'ADMIN_ROLE') {
            next();
        } else {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'El usuario no es administrador'
                }
            });
        }

    });
}


module.exports = {
    verificaToken,
    verificaAdminRol
}