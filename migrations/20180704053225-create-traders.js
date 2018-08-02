'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('traders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      emailVerified: {
        type: Sequelize.BOOLEAN
      },
      accountActive: {
        type: Sequelize.BOOLEAN
      },
      accountDelete: {
        type: Sequelize.BOOLEAN
      },
      localTradeActive: {
        type: Sequelize.BOOLEAN
      },
      google2FAActive: {
        type: Sequelize.BOOLEAN
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('traders');
  }
};