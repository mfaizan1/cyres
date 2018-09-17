'use strict';
module.exports = (sequelize, DataTypes) => {
  var Withdraws = sequelize.define('Withdraws', {
    addres_to:{
      type:DataTypes.STRING,
      allowNull:false,
      
    },
    amount:{
      type:DataTypes.DECIMAL,
      allowNull:false,
    } ,
    emailApproved: {
      type:DataTypes.BOOLEAN,
      defaultValue:false,
    },
    adminApproved: {
      type:DataTypes.BOOLEAN,
      defaultValue:false,
    },
    status: {
      type:DataTypes.STRING,
      defaultValue:"approval pending"
    }
  }, {});
  Withdraws.associate = function(models) {
    
  };
  return Withdraws;
};