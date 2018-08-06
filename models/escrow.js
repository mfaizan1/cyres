'use strict';
module.exports = (sequelize, DataTypes) => {
  var escrow = sequelize.define('escrow', {
    quantity:{
      type:DataTypes.DECIMAL,
      allowNull: false
    }
    ,traderId:{
      type:DataTypes.INTEGER,
      allowNull:false,
      unique:"compositeIndex"
    }
    ,heldById:{
      type:DataTypes.INTEGER,
      allowNull:false,
      unique:"compositeIndex"
    }
    ,supportedTokenId:{
      type:DataTypes.INTEGER,
      allowNull:false,
      unique:"compositeIndex"
    }

  }, {});
  escrow.associate = function(models) {
    // associations can be defined here
  };
  return escrow;
};