'use strict';
module.exports = (sequelize, DataTypes) => {
  var conversation = sequelize.define('conversation', {
    deletedByUserOne:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },
    deletedByUserTwo:{
      type:DataTypes.BOOLEAN,
      defaultValue:false  
    },

  }, {});
  conversation.associate = function(models) {

    conversation.hasMany(models.messages);
  };
  return conversation;
};