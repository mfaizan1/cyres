'use strict';
module.exports = (sequelize, DataTypes) => {
  var Wallets = sequelize.define('Wallets', {
    address: DataTypes.STRING,
    balance: DataTypes.DECIMAL,
    traderId:{
      type: DataTypes.STRING,
      unique:false
    }
  }, {});


  Wallets.associate=(models)=>{
      Wallets.hasMany(models.Withdraws,{foreignKey: 'walletId', sourceKey: 'walletId'});
  }
  return Wallets;
};