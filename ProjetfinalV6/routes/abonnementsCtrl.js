// Importation des modules
var models = require('../models');

// Fonction d'assistance pour trouver un abonné par ID utilisateur
function findFollowerById(userId, followerId, callback) {
    models.Abonnement.findOne({
      where: {
        id_utilisateur: followerId,
        idutilisateursuivi: userId
      }
    })
    .then(function(followerFound) {
      callback(null, followerFound);
    })
    .catch(function(err) {
      callback({ 'error': 'unable to verify follower' });
    });
}
  
// Fonction d'assistance pour trouver un abonnement par ID utilisateur
function findSubscriptionById(userId, subscriptionId, callback) {
models.Abonnement.findOne({
    where: {
    id_utilisateur: userId,
    idutilisateursuivi: subscriptionId
    }
})
.then(function(subscriptionFound) {
    callback(null, subscriptionFound);
})
.catch(function(err) {
    callback({ 'error': 'unable to verify subscription' });
});
}

// Configuration des routes
module.exports = {
    //S'abonner à quelqu'un
    subscribe: function (requete, reponse) {
        // Récupération de l'en-tête d'authentification
        var headerAuth = requete.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        // Paramètres
        var userIdToSubscribe = requete.body.userIdToSubscribe;

        // Vérification des paramètres
        if (!userIdToSubscribe) {
            return reponse.status(400).json({ 'error': 'missing parameters' });
        }

        // Vérification si l'utilisateur à suivre existe
        models.User.findOne({
            where: { id: userIdToSubscribe }
        })
            .then(function (userToSubscribe) {
                if (userToSubscribe) {
                    // Vérification si l'utilisateur n'est pas déjà abonné
                    models.Abonnement.findOne({
                        where: { id_utilisateur: userId, id_utilisateursuivi: userIdToSubscribe }
                    })
                        .then(function (subscription) {
                            if (!subscription) {
                                // Création de l'abonnement
                                models.Abonnement.create({
                                    id_utilisateur: userId,
                                    id_utilisateursuivi: userIdToSubscribe
                                })
                                    .then(function () {
                                        return reponse.status(201).json({ 'message': 'subscription successful' });
                                    })
                                    .catch(function (err) {
                                        return reponse.status(500).json({ 'error': 'unable to subscribe' });
                                    });
                            } else {
                                return reponse.status(409).json({ 'error': 'already subscribed' });
                            }
                        })
                        .catch(function (err) {
                            return reponse.status(500).json({ 'error': 'unable to verify subscription' });
                        });
                } else {
                    return reponse.status(404).json({ 'error': 'user to subscribe not found' });
                }
            })
            .catch(function (err) {
                return reponse.status(500).json({ 'error': 'unable to verify user to subscribe' });
            });
    },

    //Se désabonner de quelqu'un
    unsubscribe: function (requete, reponse) {
        // Récupération de l'en-tête d'authentification
        var headerAuth = requete.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        // Paramètres
        var userIdToUnsubscribe = requete.body.userIdToUnsubscribe;

        // Vérification des paramètres
        if (!userIdToUnsubscribe) {
            return reponse.status(400).json({ 'error': 'missing parameters' });
        }

        // Vérification si l'utilisateur à désabonner existe
        models.User.findOne({
            where: { id: userIdToUnsubscribe }
        })
            .then(function (userToUnsubscribe) {
                if (userToUnsubscribe) {
                    // Vérification si l'utilisateur est abonné
                    models.Abonnement.findOne({
                        where: { id_utilisateur: userId, id_utilisateursuivi: userIdToUnsubscribe }
                    })
                        .then(function (subscription) {
                            if (subscription) {
                                // Suppression de l'abonnement
                                subscription.destroy()
                                    .then(function () {
                                        return reponse.status(200).json({ 'message': 'unsubscription successful' });
                                    })
                                    .catch(function (err) {
                                        return reponse.status(500).json({ 'error': 'unable to unsubscribe' });
                                    });
                            } else {
                                return reponse.status(404).json({ 'error': 'not subscribed' });
                            }
                        })
                        .catch(function (err) {
                            return reponse.status(500).json({ 'error': 'unable to verify subscription' });
                        });
                } else {
                    return reponse.status(404).json({ 'error': 'user to unsubscribe not found' });
                }
            })
            .catch(function (err) {
                return reponse.status(500).json({ 'error': 'unable to verify user to unsubscribe' });
            });
    },

    //Voir nombre abonné(avec une liste de leurs pseudos) 
    getFollowers: function (requete, reponse) {
        // Récupération de l'en-tête d'authentification
        var headerAuth = requete.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        models.Abonnement.count({
            where: { id_utilisateursuivi: userId }
        })
            .then(function (count) {
                // Récupération de la liste des pseudos des abonnés
                models.Abonnement.findAll({
                    where: { id_utilisateursuivi: userId },
                    include: [{
                        model: models.User,
                        as: 'userSuiveur',
                        attributes: ['username']
                    }]
                })
                    .then(function (followers) {
                        return reponse.status(200).json({ 'count': count, 'followers': followers });
                    })
                    .catch(function (err) {
                        return reponse.status(500).json({ 'error': 'unable to fetch followers' });
                    });
            })
            .catch(function (err) {
                return reponse.status(500).json({ 'error': 'unable to fetch follower count' });
            });
    },

    //Voir nombre abonnement(avec une liste de leurs pseudos) 
    getFollowing: function (requete, reponse) {
        // Récupération de l'en-tête d'authentification
        var headerAuth = requete.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        models.Abonnement.count({
            where: { id_utilisateur: userId }
        })
            .then(function (count) {
                // Récupération de la liste des pseudos des personnes suivies
                models.Abonnement.findAll({
                    where: { id_utilisateur: userId },
                    include: [{
                        model: models.User,
                        as: 'userSuivi',
                        attributes: ['username']
                    }]
                })
                    .then(function (following) {
                        return reponse.status(200).json({ 'count': count, 'following': following });
                    })
                    .catch(function (err) {
                        return reponse.status(500).json({ 'error': 'unable to fetch following' });
                    });
            })
            .catch(function (err) {
                return reponse.status(500).json({ 'error': 'unable to fetch following count' });
            });
    },
}
