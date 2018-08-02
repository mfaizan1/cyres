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
    values:['Completed','Active','Cancelled','In dispute','Dispute over']},
    feedbackGiven: DataTypes.BOOLEAN,
    traderId:{
      type:DataTypes.INTEGER,
      unique:false,
      allowNull:false
    },
    clientId:{
      type:DataTypes.INTEGER,
      unique:false,
      allowNull:false
    },
    supportedTokenId:{
      type:DataTypes.INTEGER,
      unique:false,
      allowNull:false
    }
  }, {});
  localTrade.associate = function(models) {
    // associations can be defined here
  };
  return localTrade;
};