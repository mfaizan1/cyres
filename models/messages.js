'use strict';
module.exports = (sequelize, DataTypes) => {
  var messages = sequelize.define('messages', {
    type: DataTypes.STRING,
    data: DataTypes.STRING
  }, {});
  messages.associate = function(models) {
    // messages.hasOne(models.traders,{as:'sender',foreignKey : 'senderId'})
  };
  return messages;
};