'use strict';
module.exports = (sequelize, DataTypes) => {
  var applicationPictures = sequelize.define('applicationPictures', {
    path: DataTypes.STRING
  }, {});
  applicationPictures.associate = function(models) {
    // associations can be defined here
  };
  return applicationPictures;
};