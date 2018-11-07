'use strict';
module.exports = (sequelize, DataTypes) => {
  var orders = sequelize.define('orders', {
    quantity: DataTypes.DOUBLE,
    price: DataTypes.DOUBLE,
    filled: DataTypes.DOUBLE,
    status: DataTypes.STRING,
    type:{
      type: DataTypes.ENUM,
      values:['market','limit']
    },
    side: {
      type: DataTypes.ENUM,
      values:['sell','buy']
    }
  }, {});
  orders.associate = function(models) {
    // associations can be defined here
  };
  return orders;
};