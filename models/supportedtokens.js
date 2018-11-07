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
  supportedTokens.hasMany(models.tradingpairs, {as: 'primary',foreignKey : 'mainTokenId'});
  supportedTokens.hasMany(models.tradingpairs, {as: 'secondary',foreignKey : 'secondaryTokenId'});
  supportedTokens.hasMany(models.coinsToTrade);
  supportedTokens.hasMany(models.localTrade);
  supportedTokens.hasMany(models.addresses);
  supportedTokens.hasOne(models.ExchangeWallets);
  supportedTokens.hasMany(models.transactions);
};

  return supportedTokens;
};