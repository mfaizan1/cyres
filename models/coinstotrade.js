'use strict';
module.exports = (sequelize, DataTypes) => {
  var coinsToTrade = sequelize.define('coinsToTrade', {
    minQuantity: DataTypes.DECIMAL,
    maxQuantity: DataTypes.DECIMAL,
    pricePerTokken: DataTypes.DECIMAL,
    tradeType: {
      type:  DataTypes.ENUM,
      values:['buy','sell'],
      unique:"compositeIndex"
      },
    paymentCurrency: DataTypes.STRING,
    paymentMethod: DataTypes.STRING,
    traderId:{
      type:DataTypes.INTEGER,
      allowNull:false,
      unique:"compositeIndex"
    },
    supportedTokenId:{
      type:DataTypes.INTEGER,
      allowNull:false,
      unique:"compositeIndex"
      
    }
  }, {});
  coinsToTrade.associate = function(models) {
    // associations can be defined here
  };
  return coinsToTrade;
};