'use strict';
module.exports = (sequelize, DataTypes) => {
  var Like = sequelize.define('Like', {
    messageId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Messages',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    isLike: DataTypes.INTEGER
  }, {});
  Like.associate = function(models) {

    models.User.belongsToMany(models.Message, {
      through: models.Like,
      foreignKey: 'user_id',
      otherKey: 'message_id',
    });

    models.Message.belongsToMany(models.User, {
      through: models.Like,
      foreignKey: 'message_id',
      otherKey: 'user_id',
    });

    models.Like.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    models.Like.belongsTo(models.Message, {
      foreignKey: 'message_id',
      as: 'message',
    });
  };
  return Like;
};