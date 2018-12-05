'use strict';
module.exports = (sequelize, DataTypes) => {
  var verificationApplication = sequelize.define('verificationApplication', {
    fullname: DataTypes.STRING,
    country: DataTypes.STRING,
    stateOrProvince: DataTypes.STRING,
    city: DataTypes.STRING,
    status: {
      type:DataTypes.STRING,
      defaultValue:"Review Pending"
    },
    reason: {
      type:DataTypes.STRING,
      allowNull : true
    },
    traderId:{
      type: DataTypes.INTEGER,
      unique:true
    },
    status:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },
    phonenumber: DataTypes.STRING,
    code: DataTypes.INTEGER
  }, {});
  verificationApplication.associate = function(models) {
    // associations can be defined here
  };
  return verificationApplication;
};