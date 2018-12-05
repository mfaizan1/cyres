'use strict';
module.exports = (sequelize, DataTypes) => {
  var candlestick = sequelize.define('candlestick', {
    day: DataTypes.DATE,
    open: DataTypes.DOUBLE,
    low: DataTypes.DOUBLE,
    high: DataTypes.DOUBLE,
    close: DataTypes.DOUBLE
  }, {});
  candlestick.associate = function(models) {
    // associations can be defined here
  };
  return candlestick;
};