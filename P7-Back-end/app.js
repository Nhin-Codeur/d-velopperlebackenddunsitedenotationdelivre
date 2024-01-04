const express = require('express');
const app = express();
const mongoose = require('mongoose'); // Plugin Mongoose pour se connecter à la data base Mongo Db
require("dotenv").config();

mongoose.connect(process.env.CONNECTURLMONGODB, {

})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((error) => console.log(error));


// const uri = "mongodb+srv://clemenceauelliot2:Th5MYaEFWnu2Z8g1@cluster0.fk5awyr.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

var bodyParser = require('body-parser')

const bookRoutes = require('./routes/book.js');
const routerUser = require('./routes/user.js');


const path = require('path');




app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});




app.use(bodyParser.json());
app.use('/api/books', bookRoutes);
app.use('/api/auth', routerUser);
app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;