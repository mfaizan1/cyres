var kafka = require('kafka-node');
var db = require('./../models');
const Sequelize = require('sequelize');


Consumer = kafka.Consumer,
client = new kafka.Client(),
consumer = new Consumer(client,
    [{ topic: 'address.created'},{ topic: 'btc.address.created'},{topic:"transaction"}],
    {
        autoCommit: true
    }
);
consumer.on('message', function (message) {
console.log("consumer message",message);
if(message.topic=="transaction"){
    module.exports.transaction(message.value);
}else if (message.topic=="address.created"){
    module.exports.updateAddress(message.value);
}
else if (message.topic=="btc.address.created"){
    module.exports.updateAddress(message.value);
    // console.log(message.value)
}
});

consumer.on('error', function (err) {
console.log('Error:',err);
})

consumer.on('offsetOutOfRange', function (err) {
console.log('offsetOutOfRange:',err);
})

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

module.exports={

async transaction(data){
    console.log("here we are");
    const parsedData =  JSON.parse(data);
    const addressDetails =  await db.addresses.findOne({where:{
        address:parsedData.to
    }});
    console.log("adddetails",addressDetails);
    if(addressDetails!=null){

        return db.sequelize.transaction(function (t) {
            return db.Wallets.findOne({where:{
                traderId:addressDetails.traderId,
                supportedTokenId:addressDetails.supportedTokenId
            }}, {transaction: t}).then(function (wallets) {
                return db.Wallets.update({
                    balance: Sequelize.literal(`balance + ${parsedData.value}`)
                  },{where:{
                      traderId:addressDetails.traderId,
                      supportedTokenId:addressDetails.supportedTokenId
                  }}, {transaction: t}).then(function(wallets){
                      return db.transactions.create(
                          {
                              txhash:parsedData.txid,
                              type:"deposit",
                              value:parsedData.value,
                              confirmations:0,
                              traderId:addressDetails.traderId,
                              supportedTokenId:addressDetails.supportedTokenId
                          },{transaction:t}
                      )
                  });
            });
          
          }).then(function (result) {
            // Transaction has been committed
            // result is whatever the result of the promise chain returned to the transaction callback
          }).catch(function (err) {
            // Transaction has been rolled back
            // err is whatever rejected the promise chain returned to the transaction callback
          });

    }

},
async updatebalance(ctx){
 try{
   await ctx.db.Wallets.update({
        balance: Sequelize.literal(`balance + ${ctx.request.body.value}`)
      },{where:{
          traderId:ctx.state.trader,
          supportedTokenId:1
      }});
   const wallet =await ctx.db.Wallets.findOne({
        attributes:['address','balance'],
        where:{
            supportedTokenId:coin.id,
            traderId:ctx.state.trader
        }
    });
ctx.body = {
    addressavailable: {
        "status": 1,
        "address": wallet.address,
        "balance":wallet.balance
    }
}
}catch(err){
console.log(err)
}
}
,
async updateAddress(data){
    console.log("update address")
    var parsedData = JSON.parse(data);
    var already_exist = await db.addresses.findOne({where:{
        traderId:parsedData.userId,
        supportedTokenId:parsedData.coinId,
    }});
if (already_exist){
    console.log("address already exists")
    return db.sequelize.transaction(function (t) {
        // chain all your queries here. make sure you return them.
        return db.addresses.update({
            new:false
         },
            {where:{
                supportedTokenId: parsedData.coinId,
                traderId:parsedData.userId
            }},
           {transaction: t}).then(function (localtrade) {
          return db.addresses.create({
              address:parsedData.address,
              traderId:parsedData.userId,
              supportedTokenId:parsedData.coinId
          }, {transaction: t}).then(function(address){
            return db.Wallets.update({
                address:parsedData.address
             },
                {where:{
                    supportedTokenId: parsedData.coinId,
                    traderId:parsedData.userId
                }},{transaction:t});
            

          })
        });
      }).then(function () {
  
        // Transaction has been committed
        // result is whatever the result of the promise chain returned to the transaction callback
      }).catch(function (err) {
console.log(err);
        // Transaction has been rolled back
        // err is whatever rejected the promise chain returned to the transaction callback
      });

}else{

    console.log("no previous addresss");
    return db.sequelize.transaction(function (t) {
        return db.addresses.create({
            address:parsedData.address,
            traderId:parsedData.userId,
            supportedTokenId:parsedData.coinId,
            new:true
        },{transaction:t}).then(function(address){
             return db.Wallets.update({
            address:parsedData.address
         },
            {where:{
                supportedTokenId: parsedData.coinId,
                traderId:parsedData.userId
            }},{transaction:t});
        })
      
      }).then(function (result) {
        // Transaction has been committed
        // result is whatever the result of the promise chain returned to the transaction callback
      }).catch(function (err) {
     console.log(err);
      });


    
}

} ,
    
async Deposit(ctx){
try{
    const symbol= ctx.request.body.symbol;
    const coin = await ctx.db.supportedTokens.findOne({
        where:{
            symbol
        }, 
    });
   const wallet =await ctx.db.Wallets.findOne({
        attributes:['address','balance'],
        where:{
            supportedTokenId:coin.id,
            traderId:ctx.state.trader
        }
    });
ctx.body = {
    addressavailable: {
        "status": 1,
        "address": wallet.address,
        "balance":wallet.balance
    }
}
}catch(err){
console.log(err)
}

},async createAddress(ctx){
    console.log("creating address")
    try{
        const symbol= ctx.request.body.symbol;
        const coin = await ctx.db.supportedTokens.findOne({
            where:{
                symbol
            }
        });

        // const already_exist= await ctx.db.Wallets.findOne({
        //     where:{
        //         supportedTokenId:coin.id,
        //         traderId:ctx.state.trader
        //     }
        // });
        // if(already_exist.address=="Not assigned"){
        
            let meta={
                "coinId":coin.id,
                "userId":ctx.state.trader
            };

         payloads = [
         { topic: symbol.toLowerCase()+".address.create", messages:[JSON.stringify(meta)] , partition: 0 }
                    ];
                   await producer.send(payloads, function (err, data) {
                            // ctx.body=data;
                            console.log(`err ${err}`);
                            if(err){
                                ctx.body = {
                                    addressavailable: {
                                        "status": 0,
                                        "message": "Address generation failed please try again"
                                    }
                                }
                            }
                            else if(data){
                                ctx.body = {
                                    addressavailable: {
                                        "status": 1,
                                        "address": "Adrress generation request sent please reload the page in a minute"
                                    }
                                }
                            }
                            console.log("data",data);
                    });
    
    

    // }


}catch(err){
    console.log(err)
    }





},
async getAlljoin(ctx){
    try{
    
    let initialWallets = null;
     await ctx.db.sequelize.query(' select * from "Wallets" inner JOIN "supportedTokens" ON "Wallets"."supportedTokenId" = "supportedTokens"."id" and "Wallets"."traderId" = :traderId',{replacements:{
        traderId:ctx.state.trader
    }})
    .spread((results, metadata) => {

        initialWallets  =  results;
    });

    console.log(`lenght ${initialWallets.length}`)
    if(initialWallets.length==0){
        const supportedTokens = await  ctx.db.supportedTokens.findAll({attributes:['id'],raw:true});
        for (var key in supportedTokens) {
            await ctx.db.Wallets.create({
                address:"Not assigned",
                balance: Math.floor(Math.random() * 100),
                locked:0,
                traderId: ctx.state.trader,
                supportedTokenId: supportedTokens[key].id
            });
        
       }
       await ctx.db.sequelize.query(' select * from "Wallets" inner JOIN "supportedTokens" ON "Wallets"."supportedTokenId" = "supportedTokens"."id" and "Wallets"."traderId" = :traderId',{replacements:{
        traderId: ctx.state.trader
        }})
     .spread((results, metadata) => {
       ctx.body  =  results;
    });



         }
         else{
             ctx.body =  initialWallets
         }
    }catch(err){
        console.log(err);
    }
},
async hideZeroBalanceWallets(ctx){

    await ctx.db.sequelize.query(' select * from "Wallets" inner JOIN "supportedTokens" ON "Wallets"."supportedTokenId" = "supportedTokens"."id" and "Wallets"."traderId" = :traderId and "Wallets"."balance" != 0',{replacements:{
        traderId: ctx.state.trader
        }})
     .spread((results, metadata) => {
       ctx.body  =  results;
    });

  },
  async withdraw(ctx){
    try{
        const coin = await ctx.db.supportedTokens.findOne(
            {
                where:{
                    symbol:ctx.request.body.symbol
                }
            }
        );

        const wallet= await ctx.db.Wallets.findOne({
            where:{
                traderId:ctx.state.trader,
                supportedTokenId:coin.id
            }
        });
        if(wallet.balance < ctx.request.body.amount){
           return ctx.body = {
                withdraw:{
                    status:0,
                    message:"Amount you entered is more than your balance, you can only withdraw upto "+wallet.balance+"."
                }
            }
        }else{
        await ctx.db.Withdraws.create({
                addres_to:ctx.request.body.address,
                amount : ctx.request.body.amount,
                traderId : ctx.state.trader,
                walletId: ctx.request.walletId,
            });
         const reaminingBalance = wallet.balance-ctx.request.body.amount;
            
         await ctx.db.Wallets.update({
            balance:reaminingBalance ,
          }, {
            where: {
                traderId : ctx.state.trader,
                supportedTokenId: coin.id 
            }
          });

          ctx.body={
              withdraw:{
                  status:1,
                  message: "withdraw submitted, please confirm from email to complete withdraw request"
              }
          }
        }
    }
    catch(err){
        console.log(500,err)
    }
  }
};