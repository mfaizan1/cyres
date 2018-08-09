'use strict';
module.exports = (sequelize, DataTypes) => {
  var admin = sequelize.define('admin', {
    name: DataTypes.STRING,
    email:{
     type: DataTypes.STRING,
     unique: true,
     allowNull:false,
     validate:{
      len:[6,100],
      isEmail: true,
     }
    } ,
    password: {
     type: DataTypes.STRING,
     allowNull:false,
     validate:{
        notEmpty:true,
        len:[8,300]
     }

    },
    accountActive: {
      type:DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue:true
    },
    twoFAActive: {
      type:DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue:false
    },
    secretKey: {
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:"none"
    }
  }, {});
  admin.associate = function(models) {
    // associations can be defined here
  };
  return admin;
};