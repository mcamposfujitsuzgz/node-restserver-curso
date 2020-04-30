const express = require('express');
const bcrypt = require('bcrypt');
const underscore = require('underscore');

const Usuario = require('../models/usuario');
const { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

const app = express();

app.get('/usuario', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    let condicion = { estado: true };
    Usuario.find(condicion, 'nombre email img role estado google')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count(condicion, (err, cuantos) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos
                });
            })

        });
});

app.post('/usuario', [verificaToken, verificaAdminRol], function(req, res) {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });


});

app.put('/usuario/:id', [verificaToken, verificaAdminRol], function(req, res) {
    let id = req.params.id;
    let body = underscore.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findOneAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.delete('/usuario/:id', verificaToken, function(req, res) {
    let id = req.params.id;

    let body = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, body, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;