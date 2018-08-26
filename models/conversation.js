'use strict';
module.exports = (sequelize, DataTypes) => {
  var conversation = sequelize.define('conversation', {
    deleted: DataTypes.BOOLEAN
  }, {});
  conversation.associate = function(models) {

    conversation.hasMany(models.messages);
  };
  return conversation;
};