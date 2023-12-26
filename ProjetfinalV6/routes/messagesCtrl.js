// Importation des modules
var models = require('../models');
var jwtUtils = require('../utils/jwt.utils');

// Configuration des routes
module.exports = {
    createMessage: function (requete, reponse) {
        // Récupération de l'en-tête d'authentification
        var headerAuth = requete.headers['Authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        console.log('UserID extracted from token:', userId);

        // Paramètres
        var title = requete.body.title;
        var content = requete.body.content;

        // Paramètres du message
        if (title == null || content == null) {
            console.log('Missing parameters');
            return reponse.status(400).json({ 'error': 'missing parameters' });
        }

        if (title.length <= 2 || content.length <= 4) {
            console.log('Invalid parameters');
            return reponse.status(400).json({ 'error': 'invalid parameters' });
        }

        // Recherche de l'utilisateur dans la base de données
        // Recherche de l'utilisateur dans la base de données
        models.User.findOne({
          where: { id: userId }
        })
          .then(function (userFound) {
            if (userFound) {
              return models.Message.create({
                title: title,
                content: content,
                likes: 0,
                UserId: userFound.id
              });
            } else {
              return Promise.reject({ status: 404, message: 'User not found' });
            }
          })
          .then(function (newMessage) {
            return reponse.status(201).json(newMessage);
          })
          .catch(function (error) {
            if (error.status) {
              return reponse.status(error.status).json({ 'error': error.message });
            } else {
              return reponse.status(500).json({ 'error': 'Cannot post message' });
            }
          });        
    },
    listMessage: function (requete, reponse) {
        var fields = requete.query.fields;
        var limit = parseInt(requete.query.limit);
        var offset = parseInt(requete.query.offset);
        var order = requete.query.order;

        if (limit > 10) {
            limit = 10;
        }

        models.Message.findAll({
            order: [(order != null) ? order.split(':') : ['title', 'ASC']],
            attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
            limit: (!isNaN(limit)) ? limit : null,
            offset: (!isNaN(offset)) ? offset : null,
            include: [{
                model: models.User,
                attributes: ['username']
            }],
            where: { userId: userId } // Ajout de la condition de recherche
        }).then(function (messages) {
            if (messages) {
                reponse.status(200).json(messages);
            } else {
                reponse.status(404).json({ "error": "no messages found" });
            }
        }).catch(function (err) {
            console.log(err);
            reponse.status(500).json({ "error": "invalid fields" });
        });
    },
    listMessage: function (requete, reponse) {
      var headerAuth = requete.headers['Authorization'];
      var userId = jwtUtils.getUserId(headerAuth);
  
      var fields = requete.query.fields;
      var limit = parseInt(requete.query.limit);
      var offset = parseInt(requete.query.offset);
      var order = requete.query.order;
  
      if (limit > 10) {
          limit = 10;
      }
  
      models.Message.findAll({
          order: [(order != null) ? order.split(':') : ['title', 'ASC']],
          attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
          limit: (!isNaN(limit)) ? limit : null,
          offset: (!isNaN(offset)) ? offset : null,
          include: [{
              model: models.User,
              attributes: ['username']
          }],
          where: { userId: userId } // Ajout de la condition de recherche
      }).then(function (messages) {
          if (messages) {
              reponse.status(200).json(messages);
          } else {
              reponse.status(404).json({ "error": "no messages found" });
          }
      }).catch(function (err) {
          console.log(err);
          reponse.status(500).json({ "error": "invalid fields" });
      });
  }  
}
