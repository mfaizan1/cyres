const Router = require('koa-router');
const router = new Router();
const isAuthenticated= require('./../policies/isAuthenticated');

const {traderController,walletsController,applicationController,adminController,localTradeController} =  require('./../controllers');
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
//wallets
router.get('/getWallets',isAuthenticated,walletsController.getAlljoin);
router.post('/depositCrypto',isAuthenticated,walletsController.Deposit);
router.post('/withdraw',isAuthenticated,walletsController.withdraw);
router.post('/hideZeroBalanceWallets',isAuthenticated,walletsController.hideZeroBalanceWallets);
//verification application

router.post('/verficationApplication',isAuthenticated,applicationController.submitApplication);
//admin
router.post('/addCurrency',adminController.addCurrency);

//Local Trade
router.post('/addLocalTrade',isAuthenticated,localTradeController.addLocalTrade);
router.post('/deleteLocalTrade',isAuthenticated,localTradeController.deleteLocalTrade);
router.post('/localtrade/search',isAuthenticated,localTradeController.search);
router.get('/localtrade/myListings',isAuthenticated,localTradeController.myLocalTrades);
router.post('/localtrade/traderprofile',isAuthenticated,localTradeController.profile);



module.exports = router;