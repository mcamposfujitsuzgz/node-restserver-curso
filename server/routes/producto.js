const express = require('express');

let { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

//listado
app.get('/producto', (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    let condicion = {};
    Producto.find(condicion)
        //.sort('descripcion')
        .skip(desde)
        .limit(limite)
        .populate('usuario')
        .populate('categoria')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.count(condicion, (err, cuantos) => {
                res.json({
                    ok: true,
                    productos,
                    cuantos
                });
            })

        });
});

// get un producto
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('usuario')
        .populate('categoria')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos

            });
        });
});

// get un producto
app.get('/producto/:id', (req, res) => {
    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (productoDB) {
                return res.json({
                    ok: true,
                    productos: productoDB
                });

            }
        })
        .populate('usuario')
        .populate('categoria');
});

// nueva categoria
app.post('/producto', verificaToken, (req, res) => {
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        descripcion: body.descripcion,
        usuario: res.usuario._id,
        precioUni: body.precioUni,
        disponible: true,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});


//actualiza solo descripcion
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let producto = {
        nombre: body.nombre,
        descripcion: body.descripcion,
        usuario: res.usuario._id,
        precioUni: body.precioUni,
        categoria: body.categoria
    };

    Producto.findByIdAndUpdate(id, producto, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

// borrado solo administrador
app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let producto = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, producto, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

module.exports = app;