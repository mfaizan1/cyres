'use strict';
module.exports = (sequelize, DataTypes) => {
  var Wallets = sequelize.define('Wallets', {
    address: DataTypes.STRING,
    balance: DataTypes.DOUBLE,
    locked: DataTypes.DOUBLE,
    traderId:{
      type: DataTypes.STRING,
      unique:false
    }
  }, {});
  Wallets.associate = function(models) {
    Wallets.hasMany(models.Withdraws,{foreignKey: 'walletId', sourceKey: 'walletId'});
  };
  return Wallets;
};