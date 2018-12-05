const UtilServices =  require('./../utils/util.service');
const JwtServices = require('./../utils/jwt.service');
const Sequelize = require('sequelize');
const db= require("./../models");
const Op = Sequelize.Op;
module.exports={
async myLocalTrades(ctx){
    try{
    ctx.body = await ctx.db.coinsToTrade.findAll({
        where:{
        traderId:ctx.state.trader,
        delete:false
    }
});
    }catch(err){
        ctx.body={localtrades:{
            status:0,
            message: "something went wrong at serverside"
        }}
        console.log(err);
    }

},
async addLocalTrade(ctx){
try{
    console.log(ctx.request.body);
        const coin= await ctx.db.supportedTokens.findOne({
        where :{
            symbol:ctx.request.body.symbol
        }
    });
    if (!coin){
      return ctx.body={addcoin:{
            status:0,
            message:"no such coin"
        }
    }
}

    if (ctx.request.body.tradeType==="sell"){
        const wallet = await ctx.db.Wallets.findOne({
            where :{
                traderId: ctx.state.trader,
                supportedTokenId:coin.id
            }
        });
        if(!wallet){
          return  ctx.body = {
              addcoin:{
                  status:0,
                  message:"There are not enough funds in your wallet."
              }
        }
    }
       else if(wallet.balance == 0){
            return  ctx.body =     {
                addcoin:{
                    status:0,
                    message:"There are not enough funds in your wallet."
                }
          }

        }else if (parseFloat(ctx.request.body.maxQuantity)>wallet.balance){
            console.log(wallet);
            return  ctx.body =     {
                addcoin:{
                    status:0,
                    message:"Maximum qunaitity cannot be greater than available balance"
                }
          }
        }
        else if (parseFloat(ctx.request.body.minQuantity)<0){
            return  ctx.body =     {
                addcoin:{
                    status:0,
                    message:"Minimum qunaitity cannot be less than 0"
                }
          }
          
        } else if (parseFloat(ctx.request.body.minQuantity)>parseFloat(ctx.request.body.maxQuantity)){
            return  ctx.body =     {
                addcoin:{
                    status:0,
                    message:"Maximum qunaitity cannot be less than minimum qunatity"
                }
          }
        }
        else if (parseFloat(ctx.request.body.maxQuantity)<0 || parseFloat(ctx.request.body.maxQuantity)<0 ){
            return  ctx.body =     {
                addcoin:{
                    status:0,
                    message:"Maximum qunaitity cannot 0 or less than 0"
                }
          }
        }
          else {
      const tradeDetails =    await ctx.db.coinsToTrade.create({
                minQuantity:ctx.request.body.minQuantity,
                maxQuantity:ctx.request.body.maxQuantity,
                pricePerTokken:ctx.request.body.pricePerTokken,
                tradeType:ctx.request.body.tradeType,
                paymentCurrency:ctx.request.body.paymentCurrency,
                paymentMethod:ctx.request.body.paymentMethod,
                traderId:ctx.state.trader,
                supportedTokenId:coin.id,
                active:true,
                delete:false
            });
            ctx.body = {
                addcoin:{
                    status:1,
                    message:"New trade detail added",
                    coinName :coin.name,
                    coinSymbol:coin.symbol,
                    minQuantity:tradeDetails.minQuantity,
                    maxQuantity:tradeDetails.maxQuantity,
                    tradeType:tradeDetails.tradeType,
                    paymentCurrency:tradeDetails.paymentCurrency,
                    paymentMethod:tradeDetails.paymentMethod,
                }
            }
        }


    

    }else if(ctx.request.body.tradeType==="buy"){
        const tradeDetails =    await ctx.db.coinsToTrade.create({
            minQuantity:ctx.request.body.minQuantity,
            maxQuantity:ctx.request.body.maxQuantity,
            pricePerTokken:ctx.request.body.pricePerTokken,
            tradeType:ctx.request.body.tradeType,
            paymentCurrency:ctx.request.body.paymentCurrency,
            paymentMethod:ctx.request.body.paymentMethod,
            traderId:ctx.state.trader,
            supportedTokenId:coin.id
        });
        ctx.body = {
            localtrade:{
                status:1,
                message:"New trade detail added",
                coinName :coin.name,
                coinSymbol:coin.symbol,
                minQuantity:tradeDetails.minQuantity,
                maxQuantity:tradeDetails.maxQuantity,
                paymentCurrency:tradeDetails.paymentCurrency,
                tradeType:tradeDetails.tradeType,
                paymentMethod:tradeDetails.paymentMethod
            }
    }
}
}catch(err){
    ctx.body={addcoin:{
        status:0,
        message: "something went wrong at serverside",
        err
    }}
    console.log(err);
}
},
async deleteLocalTrade(ctx){
    try{
      const del = await ctx.db.coinsToTrade.update(
          {
              delete:true
            },
        {
            where:{
                id:ctx.request.body.id,
                traderId : ctx.state.trader
            }
        });
        if(del){
ctx.body = {
    localTradeDelete:{
            staus:1,
            message:"Local trade details deleted successfully"
} }
    }else{
       ctx.body= {localTradeDelete:{
            staus:0,
            message:"No such trade details available"
} }
    }
}catch (err){
    ctx.body={localTradeDelete:{
        status:0,
        message: "something went wrong at serverside"
    }}
    console.log(err);
    }
      
},
async search(ctx)
{
    try{
    await ctx.db.sequelize.query('SELECT \
    "traders"."id" as "traderId" ,"traders"."name", "supportedTokens"."symbol", \
    "coinsToTrades"."id" as "tradeId","coinsToTrades"."traderId" as "traderIdFromTradesTable","coinsToTrades"."tradeType","coinsToTrades"."minQuantity","coinsToTrades"."maxQuantity","coinsToTrades"."paymentCurrency","coinsToTrades"."paymentMethod","coinsToTrades"."supportedTokenId" as "tokkenId",\
    "verificationApplications"."country" \
    FROM "traders" \
    FULL OUTER JOIN "verificationApplications" ON "traders"."id" = "verificationApplications"."traderId" \
    FULL OUTER JOIN "coinsToTrades" ON "traders"."id" = "coinsToTrades"."traderId" \
    FULL OUTER JOIN "supportedTokens" ON "coinsToTrades"."supportedTokenId" = "supportedTokens"."id" \
    WHERE \
    "coinsToTrades"."active" = true and \
    "coinsToTrades"."delete" = false and \
    "coinsToTrades"."paymentCurrency" = :paymentCurrency \
    and "supportedTokens"."symbol" = :currency and \
    "coinsToTrades"."tradeType" = :tradeType and \
    "verificationApplications"."country" = :country and \
    "coinsToTrades"."traderId" != :currentUser',
    { replacements: { 
        paymentCurrency: ctx.request.body.paymentCurrency,
        currency:ctx.request.body.currency,
        tradeType:ctx.request.body.tradeType,
        country:ctx.request.body.country,
        currentUser:ctx.state.trader
     } }
  ).spread((results, metadata) => {
      console.log(results);
    ctx.body=results;
});
}catch(err){
    ctx.body={search:{
        status:0,
        message: "something went wrong at serverside"
    }}
    console.log(err);
}
},
async tradePage(ctx){
    try{
        let details=null;
        let totalTrades= null;
        console.log("ctx.body "+ctx.body);

        const already_active= await ctx.db.localTrade.findOne({
            where:{
                status:"Active",
                clientId:ctx.state.trader,
                supportedTokenId:ctx.request.body.tokkenId,
                traderId:ctx.request.body.traderId
            }
        });
        console.log("ctx.body "+already_active);
        if (already_active){
            return ctx.body={ tradePage:{
                status:2,
                message:"already initiated",
                tradeId:already_active.id,
            }
            }
        }
    await ctx.db.sequelize.query('select "traders"."id" as "traderId","traders"."name" as "traderName", "coinsToTrades"."id" as "tradeId","coinsToTrades"."minQuantity","coinsToTrades"."maxQuantity","coinsToTrades"."pricePerTokken","coinsToTrades"."supportedTokenId" as "tokenId", "coinsToTrades"."paymentMethod" , "verificationApplications"."status", \
    "supportedTokens"."name","supportedTokens"."symbol" \
    from "coinsToTrades" \
    full outer join "verificationApplications" on "verificationApplications"."traderId" = "coinsToTrades"."traderId" \
    full outer join "supportedTokens" on "supportedTokens"."id" = "coinsToTrades"."supportedTokenId" \
    full outer join "traders" on "coinsToTrades"."traderId" = "traders"."id" \
    where "coinsToTrades"."traderId" = :traderId and "coinsToTrades"."supportedTokenId" = :tokkenId',{replacements:{
    traderId:ctx.request.body.traderId,
    tokkenId:ctx.request.body.tokkenId
    }}).spread((results, metadata) => {
        details =results;
  });

if (details){

    await ctx.db.sequelize.query(`select count("localTrades"."status") as "totalTrades" \
    from "localTrades" where "localTrades"."status" = 'Completed' and "localTrades"."traderId" = :traderId`,{replacements:{
        traderId:ctx.request.body.traderId
    }}).spread((results, metadata) => {
        totalTrades=results;
        ctx.body= {tradePage:{
            status:1,
            traderId: details[0].traderId,
            tokenId:details[0].tokenId,
            tradeId:details[0].tradeId,
            traderName:details[0].traderName,
            coinName:details[0].name,
            minQuantity:details[0].minQuantity,
            maxQuantity:details[0].maxQuantity,
            pricePerTokken:details[0].pricePerTokken,
            paymentMethod:details[0].paymentMethod,
            documentStatus: details[0].status,
            totaltrades:totalTrades[0].totalTrades
          }}
  });

}
    }catch(err){
        ctx.body={tradePage:{
            status:0,
            message: "something went wrong at serverside"
        }}
        console.log(err);
    }
},
async initiateBuyTrade(ctx){
    try{
        console.log(ctx.request.body );
        const already_active= await ctx.db.localTrade.findOne({
            where:{
                status:"Active",
                clientId:ctx.state.trader,
                supportedTokenId:ctx.request.body.tokenId,
                traderId:ctx.request.body.traderId
            }
        });
        console.log("already active"+already_active);
        if (already_active){
            return ctx.body={ tradePage:{
                status:0,
                message:"already initiated",
                tradeId:already_active.id,
            }
            }
        }

        const sellerWallet = await ctx.db.Wallets.findOne({
            where:{
                traderId:ctx.request.body.traderId,
                supportedTokenId:ctx.request.body.tokenId
            }
        });
        const coinTotrade = await ctx.db.coinsToTrade.findOne({
            where:{
                id: ctx.request.body.coinsToTradeId
            }

        })

        console.log(sellerWallet.balance - parseFloat(ctx.request.ctx.request.body.quantity));
        if(sellerWallet.balance - parseFloat(ctx.request.ctx.request.body.quantity)<coinTotrade.maxQuantity){
            console.log("if part");
            return ctx.db.sequelize.transaction(function (t) {
                // chain all your queries here. make sure you return them.
                return ctx.db.localTrade.create({
                     quantity: ctx.request.body.quantity,
                      traderId: ctx.request.body.traderId,
                      status:'Active',
                      clientId: ctx.state.trader,
                      feedbackGiven:false,
                      supportedTokenId: ctx.request.body.tokenId,
                      coinsToTradeId:ctx.request.body.coinsToTradeId
                  }, {transaction: t}).then(function (localtrade) {
                  return ctx.db.Wallets.update({
                    balance: Sequelize.literal(`balance - ${ctx.request.body.quantity}`)
                  },{where:{
                      traderId:ctx.request.body.traderId,
                      supportedTokenId:ctx.request.body.tokenId
                  }}, {transaction: t}).then(function(wallet){
                      return ctx.db.coinsToTrade.update({
                          active:false
                      },{
                          where:{
                              id:ctx.request.body.coinsToTradeId
                          }
                      },{transaction:t})
                  });
                });
              }).then(function (Wallets) {
                ctx.body= { buy:{
                    status:1,
                    message:"Buy request sent"
                }
            }
                // Transaction has been committed
                // result is whatever the result of the promise chain returned to the transaction callback
              }).catch(function (err) {
    
                if(err.constructor.name==='UniqueConstraintError'){
                    ctx.body= { buy:{
                        status:0,
                        message:"You cannot create two trades with same seller at same time"
                    }
                }
            
            }
                // Transaction has been rolled back
                // err is whatever rejected the promise chain returned to the transaction callback
              });
    

        }else{

        return ctx.db.sequelize.transaction(function (t) {
            console.log("else part");
            // chain all your queries here. make sure you return them.
            return ctx.db.localTrade.create({
                quantity: ctx.request.body.quantity,
                  traderId: ctx.request.body.traderId,
                  status:'Active',
                  clientId: ctx.state.trader,
                  feedbackGiven:false,
                  supportedTokenId: ctx.request.body.tokenId,
                  coinsToTradeId:ctx.request.body.coinsToTradeId
              }, {transaction: t}).then(function (localTrade) {
              return ctx.db.Wallets.update({
                balance: Sequelize.literal(`balance - ${ctx.request.body.quantity}`)
              },{where:{
                  traderId:ctx.request.body.traderId,
                  supportedTokenId:ctx.request.body.tokenId
              }}, {transaction: t});
            });
          }).then(function (Wallets) {
           return ctx.body = { buy:{
                status:1,
                message:"Buy request sent"
            }
        }
            // Transaction has been committed
            // result is whatever the result of the promise chain returned to the transaction callback
          }).catch(function (err) {

            if(err.constructor.name==='UniqueConstraintError'){
              return  ctx.body= { buy:{
                    status:0,
                    message:"You cannot create two trades with same seller at same time"
                }
            }
        
        }
            // Transaction has been rolled back
            // err is whatever rejected the promise chain returned to the transaction callback
          });

        }
    }catch(err){
        console.log('fuck', err);
        ctx.body= { 
            buy:{
            status:0,
            message:"Something gone wrong"}
    }
    }

},
async myLocalActiveTrades(ctx){
    try{
        await ctx.db.sequelize.query('select "localTrades"."id","localTrades"."status","localTrades"."feedbackGiven", "localTrades"."clientId","localTrades"."traderId","supportedTokens"."name"  from "localTrades" \
        join "supportedTokens" on "localTrades"."supportedTokenId" = "supportedTokens"."id" \
        where "localTrades"."status" = \'Active\' and  ("localTrades"."clientId" = :traderId OR "localTrades"."traderId" = :traderId)' ,{replacements:{
        traderId:ctx.state.trader,
        }}).spread((results, metadata) => {
            for (let key in results){
                console.log(results[key].clientId,results[key].traderId);

              if(ctx.state.trader==results[key].clientId){
                results[key].role="buyer"
            }
            else{
              results[key].role="seller"
            }
            }
            ctx.body= results;
      });
    }catch(err){
        console.log(err);

    }
},
async localTrade(ctx){
    try{
   
        await ctx.db.sequelize.query('select "localTrades"."id","localTrades"."status","localTrades"."feedbackGiven","localTrades"."clientId","localTrades"."traderId", \
		"traders"."name" as "traderName" ,"supportedTokens"."name"  from "localTrades"  \
        join "traders" on "localTrades"."traderId" = "traders"."id" \
        join "supportedTokens" on "localTrades"."supportedTokenId" = "supportedTokens"."id" \
        where "localTrades"."id" = :tradeId',{replacements:{
        tradeId:ctx.request.body.tradeId,
        }}).spread((results, metadata) => {
            if (ctx.state.trader==results.clientId){
                results.role= "client"

            }
            else if(ctx.state.trader==results.traderId){
                results.role= "trader"
            }
            else {
                results.role= "what"
            }
            ctx.body = results;
      });
    }catch(err){

    }


},
async cancelTrade(ctx){

    try{


        
        const localtrade =  await ctx.db.localTrade.findOne({
            where :{
                id:ctx.request.body.localTradeId
            }
        });

        const sellerWallet = await ctx.db.Wallets.findOne({
            where:{
                traderId:localtrade.traderId,
                supportedTokenId:localtrade.supportedTokenId
            }
        });
        const coinToTrade = await ctx.db.coinsToTrade.findOne({
            where:{
                id: localtrade.coinsToTradeId
            }
        })
    if (sellerWallet.balance+localtrade.quantity > coinToTrade.maxQuantity){
        console.log("if part")
        return ctx.db.sequelize.transaction(function (t) {
            // chain all your queries here. make sure you return them.
            return ctx.db.localTrade.update({
                  status:'Cancelled'
              },{where:{
                id:ctx.request.body.localTradeId,
                clientId:ctx.state.trader
            }}, {transaction: t}).then(function (localTrade){
                    return ctx.db.localTrade.findOne({
                        where:{
                            id:ctx.request.body.localTradeId,
                            clientId:ctx.state.trader,
                            status:"Cancelled"
                        }
                    })
            },{transaction:t}).then(function (localTrade) {
                console.log("local trade is returning"+localTrade);
              return ctx.db.Wallets.update({
                balance: Sequelize.literal(`balance + ${localTrade.quantity}`)
              },{where:{
                  traderId:localTrade.traderId
              }}, {transaction: t}).then(function (wallet){
                return ctx.db.coinsToTrade.update({
                    active:true
                },{
                    where:{
                        id:localtrade.coinsToTradeId
                    }
                },{transaction: t});
            });
            });
          }).then(function (Wallets) {
            ctx.body= { buyCancel:{
                status:1,
                message:"Buy request cancelled"
            }
        }
            // Transaction has been committed
            // result is whatever the result of the promise chain returned to the transaction callback
          }).catch(function (err) {
              console.log(err);
              ctx.body= { buyCancel:{
                status:0,
                message:"Something gone wrong"
            }
        }
            // Transaction has been rolled back
            // err is whatever rejected the promise chain returned to the transaction callback
          });

    }else{
        console.log("if part")
        return ctx.db.sequelize.transaction(function (t) {
            // chain all your queries here. make sure you return them.
            return ctx.db.localTrade.update({
                  status:'Cancelled'
              },{where:{
                id:ctx.request.body.localTradeId,
                clientId:ctx.state.trader
            }}, {transaction: t}).then(function (localTrade){
         
                    return ctx.db.localTrade.findOne({
                        where:{
                            id:ctx.request.body.localTradeId,
                            clientId:ctx.state.trader,
                            status:"Cancelled"
                        }
                    })
                
            }).then(function (localTrade) {
                console.log("local trade is returning"+localTrade);
              return ctx.db.Wallets.update({
                balance: Sequelize.literal(`balance + ${localTrade.quantity}`)
              },{where:{
                  traderId:localTrade.traderId
              }}, {transaction: t});
            })
          }).then(function (Wallets) {
            ctx.body= { buyCancel:{
                status:1,
                message:"Buy request cancelled"
            }
        }
            // Transaction has been committed
            // result is whatever the result of the promise chain returned to the transaction callback
          }).catch(function (err) {
              console.log(err);
              ctx.body= { buyCancel:{
                status:0,
                message:"Something gone wrong"
            }
        }
            // Transaction has been rolled back
            // err is whatever rejected the promise chain returned to the transaction callback
          });
    }


       



    }catch(err){
        console.log(err)
        ctx.body= { 
            buyCancel:{
            status:0,
            message:"Something gone wrong"}
    }
    }

}
,async completeTrade(ctx){
    try{
        return ctx.db.sequelize.transaction(function (t) {
            console.log("here");
            // chain all your queries here. make sure you return them.
            return ctx.db.localTrade.update({
                  status:'Completed'
              },{where:{
                id:ctx.request.body.localTradeId,
                traderId:ctx.state.trader
            }}, {transaction: t}).then(function (localTrade) {
        
                    return ctx.db.localTrade.findOne({
                      },{where:{
                        localTradeId:ctx.request.body.localTradeId,
                        traderId:ctx.state.trader,
                        status:'Completed'
                      }}, {transaction: t})
                
              }).then(function (localTrade) {
              return ctx.db.Wallets.update({
                field: Sequelize.literal(`balance + ${localTrade.quantity-(localTrade.quantity*0.01)}`)
              },{where:{
                  traderId:localTrade.clientId
              }}, {transaction: t});
            }).then(function (localTrade) {
                return ctx.db.ExchangeWallets.update({
                  field: Sequelize.literal(`balance + ${localTrade.quantity*0.01}`)
                },{where:{
                    supportedTokenId:localTrade.supportedTokenId
                }}, {transaction: t});
              });
          }).then(function (Wallets) {
              console.log(Wallets);
            ctx.body= { order:{
                status:1,
                message:"Order Completed"
            }
        }
            // Transaction has been committed
            // result is whatever the result of the promise chain returned to the transaction callback
          }).catch(function (err) {
              console.log(err);
              ctx.body= { order:{
                status:0,
                message:"Something gone wrong"
            }
        }
            // Transaction has been rolled back
            // err is whatever rejected the promise chain returned to the transaction callback
          });



    }catch(err){
        ctx.body= { 
            order:{
            status:0,
            message:"Something gone wrong"}
    }
    }
},
async feedback(ctx){
    try{
        console.log("here");
            const localTrade =  await ctx.db.localTrade.findOne({
                where:{
                    id:ctx.request.body.localTradeId
                }
            });
            console.log(localTrade);
            console.log("here");
            if(localTrade ===null)
            {
               return ctx.body={
                    feedback:{
                        status:0,
                        message: "unable to find local trade."
                    }
                }
            }
          else if(localTrade.feedbackGiven){
                return ctx.body = {
                    feedback:{
                        status:0,
                        message: "you have already given feedback on this trade"
                    }
                }
              
            }
            else if(localTrade.status !== "Completed") {
                return ctx.body = {
                    feedback:{
                        status:0,
                        message: "you cannot give feedback on uncompleted trade"
                    }
                }
                    
            }
            else {
                return ctx.db.sequelize.transaction(function (t) {
                    return ctx.db.localTrade.update({ 
                        feedbackGiven:'true'
                    },{where:{
                      id:ctx.request.body.localTradeId,
                      clientId:ctx.state.trader
                  }}, {transaction: t}).then(function(){

                    return ctx.db.feedback.create({
                        rating: ctx.request.body.rating,
                        comment:ctx.request.body.comment,
                        localTradeId:ctx.request.body.localTradeId,
                        feedbackClientId:ctx.state.trader,
                        traderId:localTrade.traderId
                         
                    })
                  }).then(function(feedback){

                      ctx.body=feedback;
                  }).catch(function(err){
                    ctx.body={
                        feedback:{
                        status:0,
                        message:"something went wrong on server side"
                        }
                    }
                  });


                });
             
                    
            }


    }catch(err){
        console.log(err);
    }
}
,async getSupportedTokens(ctx){
        ctx.body =  await ctx.db.supportedTokens.findAll({
            attributes:['id','symbol']
        })
},
async getLocaltrades(){
    console.log("hello");
    const dates = await db.localTrade.findAll({
        where:{
            status:"Active"
        },

          attributes:['id','createdAt'],
          raw:true
    })
    console.log(dates);

    dates.forEach(element => {
        console.log(element.createdAt);
        const timePassed = (Date.now() - Date.parse(element.createdAt))/60000;
        console.log((Date.now() - Date.parse(element.createdAt))/60000)
        console.log(element)
        if(timePassed>180){
            try{
        return db.sequelize.transaction(function (t) {
                    // chain all your queries here. make sure you return them.
                    return db.localTrade.update({
                          status:'Cancelled'
                      },{where:{
                        id:element.id
                    }}, {transaction: t}).then(function (localTrade) {
                        console.log(localTrade);
                        return db.escrow.findOne({where:{
                            localTradeId:element.id,
                          }}, {transaction: t})
                      }).then(function (escrow) {
                          console.log(escrow);
                      return db.Wallets.update({
                        balance: Sequelize.literal(`balance + ${escrow.quantity}`)
                      },{where:{
                          traderId:escrow.traderId
                      }}, {transaction: t});
                    }).then(function (escrow) {
                        console.log(escrow);
                        return db.escrow.destroy({where:{
                            localTradeId:element.Id
                          }}, {transaction: t})
                      });
                  }).then(function (Wallets) {
                      console.log(Wallets);
                    // Transaction has been committed
                    // result is whatever the result of the promise chain returned to the transaction callback
                  }).catch(function (err) {
                      console.log(err);
                    // Transaction has been rolled back
                    // err is whatever rejected the promise chain returned to the transaction callback
                  });
        
            }catch(err){
    console.log(err);
            }
        }else{
            console.log("let it stay");
        }
    });
},

async sendSellRequest(){


    
},


async getTradeDetails(ctx){


    const tradedetails= await ctx.db.localTrade.findOne({
        where:{
            id:ctx.request.body.localTradeId,
            [Op.or]: [{clientId: ctx.state.trader},{traderId:ctx.state.trader}]
        },
        raw:true
        })

            if(ctx.state.trader==tradedetails.clientId){
                tradedetails.role="buyer"
            }
            else {
             
                tradedetails.role="seller"
                  
            }

        console.log("trade details with roles",tradedetails)
        let time = Date.parse(tradedetails.createdAt)+10800000;
        tradedetails.deadline = time;
     
        console.log(tradedetails);
    ctx.body =  tradedetails;
}
};


