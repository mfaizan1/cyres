const Router = require('koa-router');
const router = new Router();
const isAuthenticated= require('./../policies/isAuthenticated');
const isAuthenticatedAdmin= require('./../policies/isAuthenticatedAdmin');

const {traderController,walletsController,applicationController,adminController,localTradeController,chatController,tradingController} =  require('./../controllers');
//trader
router.post('/signup',traderController.signup);
router.post('/login',traderController.login);
router.get('/profile',isAuthenticated,traderController.ViewAccountDetails);
router.get('/editProfile',isAuthenticated,traderController.editAccountDetails);
router.post('/saveProfile',isAuthenticated,traderController.saveAccountDetails);
router.post('/changePassword',isAuthenticated,traderController.editPassword);
router.post('/disableAccount',isAuthenticated,traderController.disableAccount);
router.post('/deleteAccount',isAuthenticated,traderController.deleteAccount);
router.post('/changeLS',isAuthenticated,traderController.changeLocalSelling);
router.get('/getSecretKey',isAuthenticated,traderController.getSecretKey);
router.post('/enable2FA',isAuthenticated,traderController.enable2FA);
router.post('/disable2FA',isAuthenticated,traderController.disable2FA);
router.post('/check',traderController.checkParameters);

//wallets
router.get('/getWallets',isAuthenticated,walletsController.getAlljoin);
router.post('/depositCrypto',isAuthenticated,walletsController.Deposit);
router.post('/withdraw',isAuthenticated,walletsController.withdraw);
router.get('/hideZeroBalanceWallets',isAuthenticated,walletsController.hideZeroBalanceWallets);
router.post('/createAddress',isAuthenticated,walletsController.createAddress);
//verification application
router.post('/verficationApplication',isAuthenticated,applicationController.submitApplication);
//admin
router.post('/addCurrency',adminController.addCurrency);
router.post('/admin/addTradingPair',adminController.addTradingPair);
router.post('/admin/signup',adminController.signup);
router.post('/admin/login',adminController.login);
router.get('/admin/viewUsers',isAuthenticatedAdmin,adminController.viewUsers);
router.post('/admin/viewUser',isAuthenticatedAdmin,adminController.viewUser);
router.post('/admin/searchUsers',isAuthenticatedAdmin,adminController.searchUsers);
router.post('/admin/deleteUser',isAuthenticatedAdmin,adminController.deleteUser);
router.get('/admin/allApplications',isAuthenticatedAdmin,adminController.allApplications);
router.post('/admin/application',isAuthenticatedAdmin,adminController.application);
router.post('/admin/approveApplication',isAuthenticatedAdmin,adminController.approveApplication);
router.post('/admin/rejectApplication',isAuthenticatedAdmin,adminController.rejectApplication);
router.get('/admin/withdraws',isAuthenticatedAdmin,adminController.withdraws);
router.post('/admin/approveWithdraw',isAuthenticatedAdmin,adminController.approveWithdraw);
router.post('/admin/rejectWithdraw',isAuthenticatedAdmin,adminController.rejectWithdraw);





//Local Trade
router.post('/addLocalTrade',isAuthenticated,localTradeController.addLocalTrade);
router.post('/deleteLocalTrade',isAuthenticated,localTradeController.deleteLocalTrade);
router.post('/localtrade/search',isAuthenticated,localTradeController.search);
router.get('/localtrade/myListings',isAuthenticated,localTradeController.myLocalTrades);
router.post('/localtrade/tradePage',isAuthenticated,localTradeController.tradePage);
router.post('/localtrade/initiatetrade',isAuthenticated,localTradeController.initiateBuyTrade);
router.get('/localtrade/myLocalTrades',isAuthenticated,localTradeController.myLocalActiveTrades);
router.post('/localtrade/localTrade',isAuthenticated,localTradeController.localTrade);
router.post('/localtrade/cancelTrade',isAuthenticated,localTradeController.cancelTrade);
router.post('/localtrade/completeTrade',isAuthenticated,localTradeController.completeTrade);
router.post('/localtrade/feedback',isAuthenticated,localTradeController.feedback);
router.get('/localtrade/allLocalTrades',localTradeController.getLocaltrades);
router.post('/localtrade/getTradeDetails',isAuthenticated,localTradeController.getTradeDetails);


router.get('/getsupportedCoins',isAuthenticated,localTradeController.getSupportedTokens);




router.post('/chat/conversation',isAuthenticated,chatController.createOrFindConversation);
router.post('/chat/insertMessage',isAuthenticated,chatController.insertMessage);
router.get('/chat/findConversations',isAuthenticated,chatController.findConversations);
router.post('/chat/sendImage',isAuthenticated,chatController.sendImage);
router.post('/chat/prevMessages',isAuthenticated,chatController.prevMessages);

router.get('/trading/:main/:secondary',isAuthenticated,tradingController.tradingPair);
router.post('/trading/order',isAuthenticated,tradingController.submitOrder);
router.get('/trading/orderHistory',isAuthenticated,tradingController.orderHistory);
router.get('/trading/activeMarket',isAuthenticated,tradingController.activeMarketOrders);
router.get('/trading/myOrders',isAuthenticated,tradingController.activeOrders);
router.post('/trading/cancelOrder',isAuthenticated,tradingController.cancelOrder);
router.get('/trading/completedOrders',tradingController.completedOrders);



module.exports = router;    