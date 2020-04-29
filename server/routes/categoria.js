const express = require('express');
const underscore = require('underscore');
let { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

//listado
app.get('/categoria', (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    let condicion = {};
    Categoria.find(condicion)
        .sort('descripcion')
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.count(condicion, (err, cuantos) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos
                });
            })

        });
});

// get una categoria
app.get('/categoria/:id', (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (categoriaDB) {
            return res.json({
                ok: true,
                categorias: categoriaDB
            });

        }
    });
});

// nueva categoria
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: res.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//actualiza solo descripcion
app.put('/categoria/:id', (req, res) => {
    let id = req.params.id;
    let body = underscore.pick(req.body, ['descripcion']);

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// borrado solo administrador
app.delete('/categoria/:id', [verificaToken, verificaAdminRol], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, { new: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

module.exports = app;