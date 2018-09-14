'use strict';
module.exports = (sequelize, DataTypes) => {
  var localTrade = sequelize.define('localTrade', {
    id:{
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quantity: DataTypes.DECIMAL,
    status:{ 
      type:DataTypes.ENUM,
      values:['Completed','Active','Cancelled','In dispute','Dispute over'],
      unique:'composite'
    },
    feedbackGiven: DataTypes.BOOLEAN,
    traderId:{
      type:DataTypes.INTEGER,
      unique:false,
      allowNull:false,
      unique:'composite'
    },
    clientId:{
      type:DataTypes.INTEGER,
      unique:false,
      allowNull:false,
      unique:'composite'
    },
    supportedTokenId:{
      type:DataTypes.INTEGER,
      unique:false,
      allowNull:false
    },
    coinsToTradeId:{
      type:DataTypes.INTEGER,
      unique:false,
      allowNull:false
    }
  }, {});
  localTrade.associate = function(models) {
  localTrade.hasMany(models.escrow);
  localTrade.hasOne(models.feedback);
  
  };
  return localTrade;
};