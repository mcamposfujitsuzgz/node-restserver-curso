// puerto
process.env.PORT = process.env.PORT || 3000;

// entorno 
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'


// base de datos
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URL_DB = urlDB;


//vencimiento del token 30 DIAS
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//seed del token
process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'este-es-secret';


//google client id
process.env.CLIENT_ID = process.env.CLIENT_ID || '530132136169-o297u9plab845fes1rei0miusdh855jq.apps.googleusercontent.com';