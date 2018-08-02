'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('verificationApplications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fullname: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      stateOrProvince: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      cardNumber: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      reason: {
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
    return queryInterface.dropTable('verificationApplications');
  }
};