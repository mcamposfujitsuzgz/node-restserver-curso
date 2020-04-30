const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res) {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo.'
            }
        });
    }

    // validacion de tipos
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitios son: ' + tiposValidos.join(', ')
            }
        });
    }

    let archivo = req.files.archivo;
    let nommbreArchivoArray = archivo.name.split('.');

    // extensiones permitidas
    let extensionesPermitidas = ['png', 'jpg', 'gif', 'jpeg'];
    let extension = nommbreArchivoArray[nommbreArchivoArray.length - 1]

    if (extensionesPermitidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Extension del archivo no permitida.'
            }
        });
    }

    //cambiar nombre del archivo
    let nommbreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    archivo.mv(`uploads/${tipo}/${nommbreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nommbreArchivo, tipo);
        }


        if (tipo === 'productos') {
            imagenProducto(id, res, nommbreArchivo, tipo);
        }

    });
});

function imagenUsuario(id, res, nommbreArchivo, tipo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(tipo, nommbreArchivo);

            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borrarArchivo(tipo, nommbreArchivo);

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borrarArchivo(tipo, usuarioDB.img);

        usuarioDB.img = nommbreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nommbreArchivo
            });
        });
    });
}

function imagenProducto(id, res, nommbreArchivo, tipo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(tipo, nommbreArchivo);

            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borrarArchivo(tipo, nommbreArchivo);

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        borrarArchivo(tipo, productoDB.img);

        productoDB.img = nommbreArchivo;
        productoDB.save((err, productoDB) => {
            res.json({
                ok: true,
                producto: productoDB,
                img: nommbreArchivo
            });
        });
    });
}

function borrarArchivo(tipo, nombreImagen) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;