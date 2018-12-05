"use strict"
const Sequelize = require('sequelize');
var kafka = require('kafka-node');
var db = require('./../models');


var kafka = require('kafka-node');
Consumer = kafka.Consumer,
client = new kafka.Client(),
consumer = new Consumer(client,
    [{ topic: 'btc.eth.orderexecuted'}],
    {
        autoCommit: true
    }
);
consumer.on('message', function (message) {

    var data=  JSON.parse(message.value);
    console.log("order Executed at price ",data.price);
    console.log("maker order id",data.maker);
    console.log("taker order id",data.taker);
    console.log("quntity is ",data.quantity);

    (async() => {
        try {
            const maker = await db.orders.findOne({where :{
                Id:data.maker
            },raw:true});
            const taker= await db.orders.findOne({where :{
                Id:data.taker
            },raw:true});
            console.log('maker -> ', maker);
            console.log('taker -> ', taker);
        } catch (err) {
            console.log(err);
        }
    })();

});

var Producer = kafka.Producer,
    client = new kafka.Client(),
    producer = new Producer(client);
producer.on('ready', function () {
    console.log('Producer is ready');
});
producer.on('error', function (err) {
    console.log('Producer is in error state');
    console.log(err);
})




var self = module.exports ={
    async sendToengine(data){
  
      var  meta = {
            "orderId": data.id,
            "orderType": data.type,
            "orderSide": data.side,
            "quantity": data.quantity,
            "price": data.price
        }
        var payloads = [
            { topic: "btc.eth.neworder", messages: [JSON.stringify(meta)], partition: 0 }
        ];
        producer.send(payloads, function (err, data) {
            console.log(`err ${err}`);
            console.log(`data ${data}`);
        });
    },
    async submitOrder(ctx){
try{
    const mainCoin = await ctx.db.supportedTokens.findOne({where:{symbol:ctx.request.body.main}});
    const secondary = await ctx.db.supportedTokens.findOne({where:{symbol:ctx.request.body.secondary}});
    if(mainCoin && secondary){
        const tradingPair =  await ctx.db.tradingpairs.findOne({where:{mainTokenId:mainCoin.id,secondaryTokenId:secondary.id}});

        if(tradingPair){
            console.log("trading pari",tradingPair);
            console.log("request",ctx.request.body);
            if(ctx.request.body.side == "buy"){
                const wallet = await ctx.db.Wallets.findOne({where:{traderId:ctx.state.trader,
                supportedTokenId:mainCoin.id}});

                if(wallet){
                    console.log("wallet",wallet);

                    if(wallet.balance >= ctx.request.body.quantity*ctx.request.body.price){
    

                        return ctx.db.sequelize.transaction(function (t) {
                            // chain all your queries here. make sure you return them.
                      
                              return ctx.db.Wallets.update({
                                balance: Sequelize.literal(`balance - ${ctx.request.body.quantity*ctx.request.body.price}`),
                                locked:Sequelize.literal(`locked + ${ctx.request.body.quantity*ctx.request.body.price}`),
                              },{where:{
                                  traderId:ctx.state.trader,
                                  supportedTokenId:mainCoin.id
                              }}, {transaction: t}).then(function(){
                                return ctx.db.orders.create({
                                    quantity: ctx.request.body.quantity,
                                    filled:0,
                                    traderId: ctx.state.trader,
                                    price:ctx.request.body.price,
                                    side:'buy',
                                    type:ctx.request.body.type,
                                    status:'Active',
                                    tradingpairId:tradingPair.id
                                  }, {transaction: t})
                              });
                          
                          }).then(function (order) {
                        
                            module.exports.sendToengine(order);
                            ctx.body= { buy:{
                                status:1,
                                message:"Buy request sent"
                            }
                        }
                            // Transaction has been committed
                            // result is whatever the result of the promise chain returned to the transaction callback
                          }).catch(function (err) {
                
                      console.log(err);
                      ctx.body = err;
                            // Transaction has been rolled back
                            // err is whatever rejected the promise chain returned to the transaction callback
                          });
                
            

                        
                    }else{
                        ctx.body={order:{
                            status:0,
                            message:"Not enough balance"
                        }}
                    }
                }
            }
           else if(ctx.request.body.side == "sell"){
            const wallet = await ctx.db.Wallets.findOne({where:{traderId:ctx.state.trader,
                supportedTokenId:secondary.id}});
                if(wallet){
                    if(wallet.balance >= ctx.request.body.quantity){
                        return ctx.db.sequelize.transaction(function (t) {
                            // chain all your queries here. make sure you return them.
                           
                              return ctx.db.Wallets.update({
                                balance: Sequelize.literal(`balance - ${ctx.request.body.quantity}`),
                                locked:Sequelize.literal(`locked + ${ctx.request.body.quantity}`),
                              },{where:{
                                  traderId:ctx.state.trader,
                                  supportedTokenId:secondary.id
                              }}, {transaction: t}).then(function(Wallets){
                                return ctx.db.orders.create({
                                    quantity: ctx.request.body.quantity,
                                    filled:0,
                                    traderId: ctx.state.trader,
                                    price:ctx.request.body.price,
                                    side:'sell',
                                    type:ctx.request.body.type,
                                    status:'Active',
                                    tradingpairId:tradingPair.id
                                  }, {transaction: t});
                              });
           
                          }).then(function (order) {
                                     
                           module.exports.sendToengine(order);
                            ctx.body= { buy:{
                                status:1,
                                message:"Sell request sent"
                            }
                        }
                            // Transaction has been committed
                            // result is whatever the result of the promise chain returned to the transaction callback
                          }).catch(function (err) {
                
                      console.log(err);
                      ctx.body = err;
                            // Transaction has been rolled back
                            // err is whatever rejected the promise chain returned to the transaction callback
                          });
                
            

                        
                    }else{
                        ctx.body={order:{
                            status:0,
                            message:"Not enough balance"
                        }}
                    }
                }
            }
        }else{
            ctx.body = {tradindpair:{
                status:0,
                message:"Trading pair is not valid."
            }}
        }
     

    }else{
        ctx.body = {
            order:{
                status:0,
                message:"Invalid arguments"
            }
        }
    }
 

}catch(err){

}

    },
    async cancelOrder(ctx){

    },
    async orderHistory(ctx){
        try{    

            ctx.body=await ctx.db.orders.findAll();

        }catch(err){
            console.log(err);

        }
    },
    async activeOrders(ctx){
    }
    ,async tradingPair(ctx){
    try{

        const mainCoin = await ctx.db.supportedTokens.findOne({where:{symbol:ctx.params.main}});
        const secondary = await ctx.db.supportedTokens.findOne({where:{symbol:ctx.params.secondary}});
        if(mainCoin && secondary){
            const tradindPair =  await ctx.db.tradingpairs.findOne({where:{mainTokenId:mainCoin.id,secondaryTokenId:secondary.id}})
            console.log("tp",tradindPair);
            if(tradindPair){
                ctx.body = {tradindpair:{
                    status:1,
                    message:"Trading pair available , send requests for order book and other acitivities"
                }}
            }else{
                ctx.body = {tradindpair:{
                    status:0,
                    message:"Trading pair is not valid."
                }}
            }
        }else{
            ctx.body = {tradindpair:{
                status:0,
                message:"Trading pair is not valid."
            }}
        }
      
    }catch(err){
        console.log(err);
    }

    }
}