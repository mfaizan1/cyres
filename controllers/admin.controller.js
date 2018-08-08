// const UtilServices =  require('./../utils/util.service');
// const JwtServices = require('./../utils/jwt.service');

module.exports={

    async signup(ctx){

        try{
            let {name,email,password}=ctx.request.body;
    
            if (!email){
                ctx.body={signup:{
                    status:0,
                    message:"Email required to signup"
                }
    
                };
            }
            if (!password){
                ctx.body={signup:{
                    status:0,
                    message:"Please provide password"
                }
    
                };
            }
            if (!name){
                ctx.body={signup:{
                    status:0,
                    message:"Name cannot be empty"
                }
    
                };
            }
            const hashpassword=await UtilServices.hashPassword(password);
             await ctx.db.traders.findOrCreate({where: {email}, defaults: {name,password:hashpassword}})
            .spread((traders, created) => {
              console.log(traders.get({
                plain: true
              }));
              console.log(created);
              if(!created){
               return  ctx.body={signup:{
                status:0,
                message:"Email already registered"
            }
    
            };
              }else {
                
                // const allTokens =  ctx.db.supportedTokens.findAll();
                // Object.keys(allTokens).forEach(function(key){
                //      ctx.db.Wallets.create({
                //         address:null,
                //         balance: 100,
                //         traderId:ctx.state.trader,
                //         supportedTokenId:allTokens[key].id
                //     });
                // });
                return   ctx.body={signup:{
                    satus:1,
                    message:"Signed up successfully"
                }
                
                };
              }
            
            });
    }catch(err){
            ctx.throw(500,"database query failed : "+err);
        }
    },
    async login(ctx){
        try{
            let tokenVerifed = false;
              let {email,password}=ctx.request.body;
              if(!email){
                ctx.body={
                    signin:{
                        status:0,
                        message:"please provide email"
                    }
                }
              }
              const trader  =await ctx.db.traders.findOne({
                  where :{
                    email
                  },
                
              });
              if (trader === null){
                return  ctx.body=  {signin:{
                    status:0,
                    message:"No such user found"
                }
        };
              }
       
              console.log(trader.twoFAActive+" "+module.exports.checkParameters(ctx.request.body.token));
    
              if (trader.twoFAActive && !module.exports.checkParameters(ctx.request.body.token)){
    
                return  ctx.body=  {signin:{
                    status:2,
                    message:"redirect to 2FA entering page"
                }
              }
            }
            else if(trader.twoFAActive && module.exports.checkParameters(ctx.request.body.token)){
               tokenVerifed = twoFa.verifySecretKey(trader.secretKey,ctx.request.body.token)
               if(!tokenVerifed)
               {
              return  ctx.body =  {login:{
                       status:0,
                       message:"Token Mismatch"
                   }}
               }
               
            }
                const matched=await UtilServices.comparePassword(password,trader.password);
                if(matched){
                console.log(trader.accountDelete);
                if(trader.accountDelete){
                    return ctx.body =  {signin:{
                        status:0,
                        message:"Account deleted please signup with new email if you want to use this platform"
                    }}
                }
                let additionalMessage='';
                if(!trader.accountActive){
    
                const record = await ctx.db.traders.update(
                {
                accountActive: true,
                },
                {
                where: {
                    id:trader.id
                }
               });
               if (record[0]==1){
                additionalMessage=" and Account reactivated"
                }
                 
               }
              const token =  JwtServices.issue({
                 payload:{
                      trader:trader.id
              }
            },'3h');
    
            let message = `Signin successful${additionalMessage}`
    
            ctx.body={signin:{
                status:1,
                message,
                token:token
            }};
        }      
    else {
         ctx.body={signin:{
                        status: 0,
                        messsage:"password incorrect"
                    }};
            }
    
            }
        catch(err){
        ctx.throw(500,err);
            }
        },

    async addCurrency(ctx){
        ctx.body = await ctx.db.supportedTokens.create({
            name : ctx.request.body.name,
            symbol: ctx.request.body.symbol
        });
    },
    async viewUsers(ctx){
        ctx.body = await ctx.db.traders.findAll();
    },
    async searchUsers(ctx){
        ctx.body = await ctx.db.traders.findAll({where:{
            email: {
                [Op.iLike]: `%${ctx.request.body.userEmail}`
              }
        }});
    }
};

