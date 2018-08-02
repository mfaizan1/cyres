'use strict';
module.exports = (sequelize, DataTypes) => {
  var feedback = sequelize.define('feedback', {
    id:{
      type:DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rating: {
      type:DataTypes.ENUM,
    values:['5','4','3','2','1']},
    comment: DataTypes.STRING, 


  }, {});
  feedback.associate = function(models) {
    // associations can be defined here
  };
  return feedback;
};