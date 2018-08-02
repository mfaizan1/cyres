'use strict';
module.exports = (sequelize, DataTypes) => {
  var escrow = sequelize.define('escrow', {
    quantity: DataTypes.DECIMAL
  }, {});
  escrow.associate = function(models) {
    // associations can be defined here
  };
  return escrow;
};