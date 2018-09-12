'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('coinsToTrades', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      minQuantity: {
        type: Sequelize.DECIMAL
      },
      maxQuantity: {
        type: Sequelize.DECIMAL
      },
      pricePerTokken: {
        type: Sequelize.DECIMAL
      },
      tradeType: {
        type: Sequelize.STRING
      },
      paymentCurrency: {
        type: Sequelize.STRING
      },
      paymentMethod: {
        type: Sequelize.STRING
      },
      active: {
        type: Sequelize.BOOLEAN
      },
      delete: {
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
    return queryInterface.dropTable('coinsToTrades');
  }
};