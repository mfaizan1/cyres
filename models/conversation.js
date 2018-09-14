'use strict';
module.exports = (sequelize, DataTypes) => {
  var conversation = sequelize.define('conversation', {
    deleted:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    }
  }, {});
  conversation.associate = function(models) {

    conversation.hasMany(models.messages);
  };
  return conversation;
};