const traderController =  require('./tradersProfile.controller');
const walletsController = require('./wallets.controller');
const applicationController = require('./application.controller');
const adminController = require('./admin.controller');
const localTradeController =  require('./localtrade.controller');
const chatController=require('./chat.controller');

module.exports={
    traderController,walletsController,applicationController,adminController,localTradeController,chatController
};