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
      twoFAActive: {
        type: Sequelize.BOOLEAN
      },
      secretKey: {
        type: Sequelize.STRING
      },
      accountDelete: {
        type: Sequelize.BOOLEAN
      },
      localTradeActive: {
        type: Sequelize.BOOLEAN
      },
      phoneNumber: {
        type: Sequelize.STRING
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