const UtilServices =  require('./../utils/util.service');
const JwtServices = require('./../utils/jwt.service');
const Sequelize = require('sequelize');
module.exports={
async myLocalTrades(ctx){
    try{
    ctx.body = await ctx.db.coinsToTrade.findAll({
        where:{
        traderId:ctx.state.trader
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
console.log(typeof(ctx.request.body.maxQuantity));
    if (ctx.request.body.tradeType==="sell"){
        const wallet = await ctx.db.Wallets.findOne({
            where :{
                traderId: ctx.state.trader,
                supportedTokenId:coin.id
            }
        });
        console.log(wallet.balance);
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
                supportedTokenId:coin.id
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
    ctx.body={localtrade:{
        status:0,
        message: "something went wrong at serverside"
    }}
    console.log(err);
}

},
async deleteLocalTrade(ctx){
    try{
      const del = await ctx.db.coinsToTrade.destroy({
            where:{
                id:ctx.request.body.id,
                traderId : ctx.state.trader
            }
        });
        if(del){
ctx.body = {localTradeDelete:{
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
    WHERE "coinsToTrades"."paymentCurrency" = :paymentCurrency \
    and "supportedTokens"."symbol" = :currency and \
    "coinsToTrades"."tradeType" = :tradeType and \
    "verificationApplications"."country" = :country and \
    "traders"."id" != :currentUser',
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
async profile(ctx){
    try{
        let details=null;
        let totalTrades= null;
        console.log("here");
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
        // console.log(results);
        details =results;
  });

if (details){

    await ctx.db.sequelize.query(`select count("localTrades"."status") as "totalTrades" \
    from "localTrades" where "localTrades"."status" = 'Completed' and "localTrades"."traderId" = :traderId`,{replacements:{
        traderId:ctx.request.body.traderId
    }}).spread((results, metadata) => {
        totalTrades=results;
        ctx.body= {traderProfile:{
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

//   await ctx.db.sequelize.query(`select count("localTrades"."status") as "totalTrades" \
//   from "localTrades" where "localTrades"."status" = 'Completed' and "localTrades"."traderId" = :traderId`,{replacements:{
//       traderId:ctx.request.body.traderId
//   }}).spread((results, metadata) => {
//       console.log(results);
//       totalTrades=results;
// });
}
    }catch(err){
        ctx.body={traderProfile:{
            status:0,
            message: "something went wrong at serverside"
        }}
        console.log(err);
    }
},
async initiateTrade(ctx){

    try{

        return ctx.db.sequelize.transaction(function (t) {
            console.log("here");
            // chain all your queries here. make sure you return them.
            return ctx.db.localTrade.create({
                quantity: ctx.request.body.quantity,
                  traderId: ctx.request.body.traderId,
                  status:'Active',
                  clientId: ctx.state.trader,
                  feedbackGiven:false,
                  supportedTokenId: ctx.request.body.tokenId
              }, {transaction: t}).then(function (localTrade) {
                return ctx.db.escrow.create({
                    quantity: ctx.request.body.quantity,
                      traderId: ctx.request.body.traderId,
                      heldById: ctx.state.trader,
                      supportedTokenId: ctx.request.body.tokenId,
                      localTradeId:localTrade.id
                  }, {transaction: t})
              }).then(function (escrow) {
              return ctx.db.Wallets.update({
                balance: Sequelize.literal(`balance - ${ctx.request.body.quantity}`)
              },{where:{
                  traderId:ctx.request.body.traderId
              }}, {transaction: t});
            });
          }).then(function (Wallets) {
              console.log(Wallets);
            ctx.body= { buy:{
                status:1,
                message:"Buy request sent"
            }
        }
            // Transaction has been committed
            // result is whatever the result of the promise chain returned to the transaction callback
          }).catch(function (err) {
              console.log(err);
              ctx.body= { buy:{
                status:0,
                message:"Something gone wrong"
            }
        }
            // Transaction has been rolled back
            // err is whatever rejected the promise chain returned to the transaction callback
          });



    }catch(err){
        ctx.body= { 
            buy:{
            status:0,
            message:"Something gone wrong"}
    }
    }

},
async myLocalTrades(ctx){
    try{
        await ctx.db.sequelize.query('select "localTrades"."id","localTrades"."status","localTrades"."feedbackGiven","traders"."name" as "traderName" ,"supportedTokens"."name"  from "localTrades" \
        join "traders" on "localTrades"."traderId" = "traders"."id" \
        join "supportedTokens" on "localTrades"."supportedTokenId" = "supportedTokens"."id" \
        where "localTrades"."clientId" = :traderId OR "localTrades"."traderId" = :traderId' ,{replacements:{
        traderId:ctx.state.trader,
        }}).spread((results, metadata) => {
            ctx.body= results;
      });
    }catch(err){

    }
},
async localTrade(ctx){
    try{
        await ctx.db.sequelize.query();
        await ctx.db.sequelize.query('select "localTrades"."id","localTrades"."status","localTrades"."feedbackGiven","traders"."name" as "traderName" ,"supportedTokens"."name"  from "localTrades" \
        join "traders" on "localTrades"."traderId" = "traders"."id" \
        join "supportedTokens" on "localTrades"."supportedTokenId" = "supportedTokens"."id" \
        where "localTrades"."id" = :tradeId',{replacements:{
        tradeId:ctx.request.body.tradeId,
        }}).spread((results, metadata) => {
            ctx.body= results;
      });
    }catch(err){

    }


},
async cancelTrade(ctx){

    try{
        console.log("wtf "+ctx.request.body);
        return ctx.db.sequelize.transaction(function (t) {
            // chain all your queries here. make sure you return them.
            return ctx.db.localTrade.update({
                  status:'Cancelled'
              },{where:{
                id:ctx.request.body.localTradeId
            }}, {transaction: t}).then(function (localTrade) {
                console.log(localTrade);
                return ctx.db.escrow.findOne({where:{
                    localTradeId:ctx.request.body.localTradeId,
                    heldById:ctx.state.trader
                  }}, {transaction: t})
              }).then(function (escrow) {
                  console.log(escrow);
              return ctx.db.Wallets.update({
                balance: Sequelize.literal(`balance + ${escrow.quantity}`)
              },{where:{
                  traderId:escrow.traderId
              }}, {transaction: t});
            }).then(function (escrow) {
                console.log(escrow);
                return ctx.db.escrow.destroy({where:{
                    localTradeId:ctx.request.body.localTradeId,
                    clientId:ctx.state.trader
                  }}, {transaction: t})
              });
          }).then(function (Wallets) {
              console.log(Wallets);
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



    }catch(err){
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
                if(localTrade[0] === 1){
                    console.log(escrow +"  OPOPOP "+localTrade);
                    return ctx.db.escrow.findOne({
                      },{where:{
                        localTradeId:ctx.request.body.localTradeId,
                        traderId:ctx.state.trader
                      }}, {transaction: t})
                }else {
                    return;
                }
             
              }).then(function (escrow) {
              return ctx.db.Wallets.update({
                field: Sequelize.literal(`balance + ${ctx.request.body.quantity}`)
              },{where:{
                  traderId:escrow.heldById
              }}, {transaction: t});
            }).then(function (localTrade) {
                return ctx.db.escrow.destroy({
                  },{where:{
                    localTradeId:ctx.request.body.localTradeId,
                    traderId:ctx.state.trader
                  }}, {transaction: t})
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
            const localTrade =  await ctx.db.localtrade.findOne({
                where:{
                    id:ctx.request.tradeId
                }
            });

            if(localTrade.feedbackGiven){
                return ctx.body = {
                    feedback:{
                        status:0,
                        message: "you have already given feedback on this trade"
                    }
                }
            }


    }catch(err){
        console.log();
    }

}




    

};

