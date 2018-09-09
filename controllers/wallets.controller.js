module.exports={
async Deposit(ctx){
try{
    const symbol= ctx.request.body.symbol;
    const coin = await ctx.db.supportedTokens.findOne({
        where:{
            symbol
        }, 
    });
    console.log(coin);
    const already_exist= await ctx.db.Wallets.findOne({
        where:{
            supportedTokenId:coin.id,
            traderId:ctx.state.trader
        }
    });
    if(already_exist.address=="Not assigned"){
        console.log("not assigned")
            const update =  await ctx.db.Wallets.update(
        {address:`${ctx.request.body.symbol}gibberishaskdjlasd`}
      ,{where:
        {supportedTokenId:coin.id,
        traderId:ctx.state.trader}}
     )      
    }
  
   const wallet =await ctx.db.Wallets.findOne({
        attributes:['address'],
        where:{
            supportedTokenId:coin.id,
            traderId:ctx.state.trader
        }
    });
ctx.body = {
    addressavailable: {
        "status": 1,
        "address": wallet.address
    }
}
}catch(err){

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


//   await ctx.db.sequelize.query("select * from \"supportedTokens\" LEFT OUTER JOIN \"Wallets\" ON \"supportedTokens\".\"id\" = \"Wallets\".\"supportedTokenId\" ")
//     .spread((results, metadata) => {
//         ctx.body=results;
//     });
      
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