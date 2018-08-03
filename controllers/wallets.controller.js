module.exports={
async getAll(ctx){
try {

    ctx.body =await ctx.db.supportedTokens.findAll({
        attributes:[
            'name','symbol']
    });
}catch(err){
    console.log(500,"Generic error : "+ err);
}
},
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
    console.log(already_exist);
    if(already_exist!==null){
     console.log("found");
ctx.body={
    addressavailable:{
    status:1,
    address:already_exist.address,
}};
    }else{
        console.log("not found");
        if(coin.id===1){
        ctx.body = await ctx.db.Wallets.create({
            address:"xrp123asdknmnk123kanm",
            balance:0,
            supportedTokenId:coin.id,
            traderId:ctx.state.trader
        });
    }else if (coin.id===2){
        ctx.body = await ctx.db.Wallets.create({
            address:"eos123asdknmnk123kanm",
            balance:0,
            supportedTokenId:coin.id,
            traderId:ctx.state.trader
        });
    }
    else if (coin.id===3){
        ctx.body = await ctx.db.Wallets.create({
            address:"btc123asdknmnk123kanm",
            balance:50,
            supportedTokenId:coin.id,
            traderId:ctx.state.trader
        });
    }
    }


}catch(err){

}

},
async getAlljoin(ctx){
    
  await ctx.db.sequelize.query("select * from \"supportedTokens\" LEFT OUTER JOIN \"Wallets\" ON \"supportedTokens\".\"id\" = \"Wallets\".\"supportedTokenId\" where traderId = :traderId",{replacements:{
      traderId:ctx.state.trader
  }})
    .spread((results, metadata) => {
        ctx.body=results;
    });
      

},
async hideZeroBalanceWallets(ctx){
    await ctx.db.sequelize.query('select * from "supportedTokens" left OUTER JOIN "Wallets" ON "supportedTokens"."id" = "Wallets"."supportedTokenId" where  "Wallets"."balance" != 0')
      .spread((results, metadata) => {
          ctx.body=results;
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
            ctx.body = {
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
                walletId: coin.id,
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