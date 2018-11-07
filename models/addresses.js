'use strict';
module.exports = (sequelize, DataTypes) => {
  var addresses = sequelize.define('addresses', {
    address: DataTypes.STRING,
    new: DataTypes.BOOLEAN
  }, {});
  addresses.associate = function(models) {
    // associations can be defined here
  };
  return addresses;
};