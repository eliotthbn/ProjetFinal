//Importation des modeles
var express = require('express');
var bodyParser = require('body-parser');
var apiRouter =  require('./apiRouter').router;

//Installation du serveur
var server = express();

//Configuration de body_parser
server.use(bodyParser.urlencoded({extended:true}));
server.use(bodyParser.json());

//Configuration des routes
server.get('/', function(requete,reponse){
    reponse.setHeader('Content-Type','text/html');
    reponse.status(200).send('<h1>Le serveur fonctionne</h1>');
});

server.use('/api/', apiRouter);

//Lancement du serveur
server.listen(8080, function(){
    console.log('Server en écoute')
});