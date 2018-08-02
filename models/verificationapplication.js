'use strict';
module.exports = (sequelize, DataTypes) => {
  var verificationApplication = sequelize.define('verificationApplication', {
    fullname: DataTypes.STRING,
    country: DataTypes.STRING,
    stateOrProvince: DataTypes.STRING,
    city: DataTypes.STRING,
    cardNumber: DataTypes.STRING,
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
    }
  }, {});
  verificationApplication.associate = function(models) {
    verificationApplication.hasMany(models.applicationPictures)
  };
  return verificationApplication;
};