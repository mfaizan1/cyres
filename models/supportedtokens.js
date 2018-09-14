'use strict';
module.exports = (sequelize, DataTypes) => {
  var supportedTokens = sequelize.define('supportedTokens', {
    name: DataTypes.STRING,
    symbol: DataTypes.STRING
  }, {
    timestamps: false,
  });
supportedTokens.associate = (models)=>{
  supportedTokens.belongsToMany(models.traders,{
    through:'Wallets'
  });
  supportedTokens.hasMany(models.coinsToTrade);
  supportedTokens.hasMany(models.localTrade);
  supportedTokens.hasOne(models.ExchangeWallets);
};

  return supportedTokens;
};