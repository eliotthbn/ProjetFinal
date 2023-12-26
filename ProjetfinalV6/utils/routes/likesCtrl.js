// Importation des modules
var models   = require('../models');
var jwtUtils = require('../utils/jwt.utils');

// Helper function to find a message by ID
function findMessageById(messageId, callback) {
  models.Message.findOne({
    where: { id: messageId }
  })
  .then(function(messageFound) {
    callback(null, messageFound);
  })
  .catch(function(err) {
    callback({ 'error': 'unable to verify message' });
  });
}

// Helper function to find a user by ID
function findUserById(userId, callback) {
  models.User.findOne({
    where: { id: userId }
  })
  .then(function(userFound) {
    callback(null, userFound);
  })
  .catch(function(err) {
    callback({ 'error': 'unable to verify user' });
  });
}

// Helper function to find a like by user and message
function findUserLike(userId, messageId, callback) {
  models.Like.findOne({
    where: {
      userId: userId,
      messageId: messageId
    }
  })
  .then(function(userAlreadyLikedFound) {
    callback(null, userAlreadyLikedFound);
  })
  .catch(function(err) {
    callback({ 'error': 'unable to verify if user already liked' });
  });
}

// Routes
module.exports = {
  likePost: function(requete, reponse) {
    var headerAuth  = requete.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    var messageId = parseInt(requete.params.messageId);

    if (messageId <= 0) {
      return reponse.status(400).json({ 'error': 'invalid parameters' });
    }

    findMessageById(messageId, function(err, messageFound) {
      if (err || !messageFound) {
        return reponse.status(404).json({ 'error': 'message not found' });
      }

      findUserById(userId, function(err, userFound) {
        if (err || !userFound) {
          return reponse.status(404).json({ 'error': 'user not found' });
        }

        findUserLike(userId, messageId, function(err, userAlreadyLikedFound) {
          if (err) {
            return reponse.status(500).json(err);
          }

          if (!userAlreadyLikedFound) {
            messageFound.addUser(userFound, { isLike: 1 })
            .then(function(alreadyLikeFound) {
              messageFound.update({ likes: messageFound.likes + 1 })
              .then(function() {
                return reponse.status(201).json(messageFound);
              })
              .catch(function(err) {
                return reponse.status(500).json({ 'error': 'cannot update message like counter' });
              });
            })
            .catch(function(err) {
              return reponse.status(500).json({ 'error': 'unable to set user reaction' });
            });
          } else {
            if (userAlreadyLikedFound.isLike === 0) {
              userAlreadyLikedFound.update({ isLike: 1 })
              .then(function() {
                messageFound.update({ likes: messageFound.likes + 1 })
                .then(function() {
                  return reponse.status(201).json(messageFound);
                })
                .catch(function(err) {
                  return reponse.status(500).json({ 'error': 'cannot update message like counter' });
                });
              })
              .catch(function(err) {
                return reponse.status(500).json({ 'error': 'cannot update user reaction' });
              });
            } else {
              return reponse.status(409).json({ 'error': 'message already liked' });
            }
          }
        });
      });
    });
  },

  dislikePost: function(requete, reponse) {
    var headerAuth  = requete.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    var messageId = parseInt(requete.params.messageId);

    if (messageId <= 0) {
      return reponse.status(400).json({ 'error': 'invalid parameters' });
    }

    findMessageById(messageId, function(err, messageFound) {
      if (err || !messageFound) {
        return reponse.status(404).json({ 'error': 'message not found' });
      }

      findUserById(userId, function(err, userFound) {
        if (err || !userFound) {
          return reponse.status(404).json({ 'error': 'user not found' });
        }

        findUserLike(userId, messageId, function(err, userAlreadyLikedFound) {
          if (err) {
            return reponse.status(500).json(err);
          }

          if (!userAlreadyLikedFound) {
            messageFound.addUser(userFound, { isLike: 0 })
            .then(function(alreadyLikeFound) {
              messageFound.update({ likes: messageFound.likes - 1 })
              .then(function() {
                return reponse.status(201).json(messageFound);
              })
              .catch(function(err) {
                return reponse.status(500).json({ 'error': 'cannot update message like counter' });
              });
            })
            .catch(function(err) {
              return reponse.status(500).json({ 'error': 'unable to set user reaction' });
            });
          } else {
            if (userAlreadyLikedFound.isLike === 1) {
              userAlreadyLikedFound.update({ isLike: 0 })
              .then(function() {
                messageFound.update({ likes: messageFound.likes - 1 })
                .then(function() {
                  return reponse.status(201).json(messageFound);
                })
                .catch(function(err) {
                  return reponse.status(500).json({ 'error': 'cannot update message like counter' });
                });
              })
              .catch(function(err) {
                return reponse.status(500).json({ 'error': 'cannot update user reaction' });
              });
            } else {
              return reponse.status(409).json({ 'error': 'message already disliked' });
            }
          }
        });
      });
    });
  }
};
