'use strict';
module.exports = (sequelize, DataTypes) => {
  var transactions = sequelize.define('transactions', {
    txhash: DataTypes.STRING,
    type: DataTypes.STRING,
    value: DataTypes.DOUBLE,
    confirmations: DataTypes.INTEGER
  }, {});
  transactions.associate = function(models) {
    // associations can be defined here
  };
  return transactions;
};