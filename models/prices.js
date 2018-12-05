'use strict';
module.exports = (sequelize, DataTypes) => {
  var prices = sequelize.define('prices', {
    price: DataTypes.DOUBLE
  }, {});
  prices.associate = function(models) {
    // associations can be defined here
  };
  return prices;
};