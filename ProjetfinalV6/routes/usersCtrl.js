//Importation des modeles
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');

//Constantes REGEX
const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX  = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{4,14}$/;

//Configuration des routes
module.exports = {
    register: function(requete, reponse){
        var email = requete.body.email;
        var username = requete.body.username;
        var password = requete.body.password;
        var bio = requete.body.bio;

        if (email == null || username == null || password == null){
            return reponse.status(400).json({'error': 'missing parameters'});
        }

        if (username.length >= 13 || username.length <= 2){
            return reponse.status(400).json({ 'error': 'wrong username (must be length 5 - 12)' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return reponse.status(400).json({ 'error': 'email is not valid' });
          }
      
          if (!PASSWORD_REGEX.test(password)) {
            return reponse.status(400).json({ 'error': 'password invalid (require at least one digit, one lowercase letter, one uppercase letter, no whitespace, and a total length between 4 and 8 characters.)' });
          }     

        models.User.findOne({
            attributes: ['email'],
            where: { email: email }
        })
        .then(function(userFound){
            if(!userFound){
                bcrypt.hash(password, 5, function( err, bcryptedPassword){
                    var newUser = models.User.create({
                        email: email,
                        username: username,
                        password: bcryptedPassword,
                        bio: bio,
                        isAdmin: 0
                    })
                    .then(function(newUser){
                        return reponse.status(201).json({
                            'userId': newUser.id
                        })
                    })
                    .catch(function(err){
                        return reponse.status(500).json({'error':'cannot add user'});
                    });
                });
            } else {
                return reponse.status(409).json({ 'error': 'user already exist'});
            }
        })
        .catch(function(err){
            return reponse.status(500).json({'error': 'unable to verify user'});
        });
    },
    login: function(requete, reponse){
        //Récupération des paramètres de connexion 
        var email = requete.body.email;
        var password = requete.body.password;

        if ( email == null || password == null) {
            return reponse.status(400).json({'error': 'missing parameters'});
        } 

        models.User.findOne({
            where: { email: email}
        })
        .then(function(userFound){
            if(userFound){
                bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt){
                    if(resBycrypt){
                        return reponse.status(200).json({
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        });
                    } else {
                        return reponse.status(403).json({"error": "invalid password"});
                    }
                });
            } else{
                return reponse.status(404).json({'error': 'user not exist in DB'});
            }
        })
        .catch(function(err){
            return reponse.status(500).json({'error': 'unable to verify user'});
        });
    },
    getUserProfile: function(requete, reponse) {
        //Récupération de l'en-tête d'authentification
        var headerAuth  = requete.headers['authorization'];
        var userId      = jwtUtils.getUserId(headerAuth);
    
        if (userId < 0)
          return reponse.status(400).json({ 'error': 'wrong token' });
    
        models.User.findOne({
          attributes: [ 'id', 'email', 'username', 'bio' ],
          where: { id: userId }
        }).then(function(user) {
          if (user) {
            reponse.status(201).json(user);
          } else {
            reponse.status(404).json({ 'error': 'user not found' });
          }
        }).catch(function(err) {
            reponse.status(500).json({ 'error': 'cannot fetch user' });
        });
      },
      updateUserProfile: function(requete, reponse) {
        // Getting auth header
        var headerAuth = requete.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
      
        // Params
        var bio = requete.body.bio;
      
        if (bio == null) {
          return reponse.status(400).json({ 'error': 'missing parameters' });
        }
      
        models.User.findOne({
          attributes: ['id', 'bio'],
          where: { id: userId }
        })
        .then(function(userFound) {
          if (userFound) {
            userFound.update({
              bio: bio
            })
            .then(function() {
              // Recherchez à nouveau l'utilisateur pour obtenir la biographie mise à jour
              models.User.findOne({
                attributes: ['id', 'bio'],
                where: { id: userId }
              })
              .then(function(updatedUser) {
                return reponse.status(201).json({
                  'bio': updatedUser.bio
                });
              })
              .catch(function(err) {
                return reponse.status(500).json({ 'error': 'unable to fetch updated user' });
              });
            })
            .catch(function(err) {
              return reponse.status(500).json({ 'error': 'cannot update user' });
            });
          } else {
            return reponse.status(404).json({ 'error': 'user not found' });
          }
        })
        .catch(function(err) {
          return reponse.status(500).json({ 'error': 'unable to verify user' });
        });
      }        
} 