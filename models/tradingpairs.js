'use strict';
module.exports = (sequelize, DataTypes) => {
  var tradingpairs = sequelize.define('tradingpairs', {
    status:  {
      type: DataTypes.ENUM,
      values:['active','inactive'],
      defaulValue:'active'
    }
  }, {});
  tradingpairs.associate = function(models) {
    tradingpairs.hasMany(models.orders);
  };
  return tradingpairs;
};