'use strict';
module.exports = (sequelize, DataTypes) => {
  var ExchangeWallets = sequelize.define('ExchangeWallets', {
    balance: DataTypes.DOUBLE
  }, {});
  ExchangeWallets.associate = function(models) {
    // associations can be defined here
  };
  return ExchangeWallets;
};