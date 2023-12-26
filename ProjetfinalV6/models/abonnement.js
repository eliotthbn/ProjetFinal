'use strict';
module.exports = (sequelize, DataTypes) => {
  var Abonnement = sequelize.define('Abonnement', {
    user_id:{
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      }
    }
  }, {});
  Abonnement.associate = function(models) {
    models.belongsTo(models.User, {
      through: models.Abonnement,
      foreignKey: 'id_user', // clé étrangère dans la table Abonnement
      as: 'user', // alias pour la relation
    });
  };
  return Abonnement;
};