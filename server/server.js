require('./config/config');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// congiguracion global de rutas
app.use(require('./routes/index'));

// mongo db
//"C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" --dbpath="c:\data\db"

//mongodb+srv://mcampos:lbTdWarFRyT4bn7G@cluster0-yqz1n.mongodb.net/cafe
//mcampos
//lbTdWarFRyT4bn7G

mongoose.connect(process.env.URL_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, err => {
    if (err) throw err;

    console.log("Base de datos Mongo");
});


app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto 3000');
})