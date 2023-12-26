//Importation des modules
var express = require('express');
var usersCtrl = require('./routes/usersCtrl');
var messagesCtrl = require('./routes/messagesCtrl');

//Configuration des routes
exports.router = (function(){
    var apiRouter = express.Router();

    //Routes pour Users
    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/me/').get(usersCtrl.getUserProfile);
    apiRouter.route('/users/me/').put(usersCtrl.updateUserProfile);

    //Routes pour Messages
    apiRouter.route('/messages/new/').post(messagesCtrl.createMessage);
    apiRouter.route('/messages/').get(messagesCtrl.listMessage);

    //Routes pour Abonnements
    apiRouter.route('/users/:userId/subscribe/:followerId').post(abonnementsCtrl.subscribe);
    apiRouter.route('/users/:userId/unsubscribe/:subscriptionId').delete(abonnementsCtrl.unsubscribe);

    return apiRouter;
})();