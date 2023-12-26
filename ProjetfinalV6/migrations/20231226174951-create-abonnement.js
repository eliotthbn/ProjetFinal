'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Abonnements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        references:{
          model: 'Users',
          key: 'id'
        }
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      id_utilisateurSuivi: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      id_utilisateurSuiveur: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      nbabonnee: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      nbabonnement: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Abonnements');
  }
};