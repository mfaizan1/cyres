'use strict';
module.exports = (sequelize, DataTypes) => {
  var traders = sequelize.define('traders', {
  

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
    emailVerified: {
      type:DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue:false
    },
    accountActive: {
      type:DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue:true
    },
    accountDelete: {
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },
    localTradeActive: {
      type:DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue:false
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
    },
  }, {});
traders.associate = (models)=>{
  traders.belongsToMany(models.supportedTokens,{
    through:'Wallets'
  });
  traders.hasMany(models.Withdraws);
  traders.hasMany(models.coinsToTrade);
  traders.hasOne(models.verificationApplication);
  traders.hasMany(models.feedback, {as: 'trader',foreignKey : 'traderId'});
  traders.hasMany(models.feedback, {as: 'feedbacker',foreignKey : 'feedbackClientId'});
  traders.belongsToMany(models.supportedTokens,{
    through:'Wallets'
  });
  traders.belongsToMany(traders, { as: 'heldBy', through: 'escrow' })
}
  return traders;
};
