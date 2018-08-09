const UtilServices =  require('./../utils/util.service');
const JwtServices = require('./../utils/jwt.service');
const Sequelize =  require('sequelize');
const Op = Sequelize.Op;
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
             await ctx.db.admin.findOrCreate({where: {email}, defaults: {name,password:hashpassword}})
            .spread((admin, created) => {
              console.log(admin.get({
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
        console.log(err);
            ctx.body={sigup:{
                status:0,
                message:"databse query failed"
            }};
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
              const admin  =await ctx.db.admin.findOne({
                  where :{
                    email
                  },
                
              });
              if (admin === null){
                return  ctx.body=  {signin:{
                    status:0,
                    message:"No such user found"
                }
        };
              }
       
            //   console.log(admin.twoFAActive+" "+module.exports.checkParameters(ctx.request.body.token));
    
            //   if (admin.twoFAActive && !module.exports.checkParameters(ctx.request.body.token)){
    
            //     return  ctx.body=  {signin:{
            //         status:2,
            //         message:"redirect to 2FA entering page"
            //     }
            //   }
            // }
            // else if(admin.twoFAActive && module.exports.checkParameters(ctx.request.body.token)){
            //    tokenVerifed = twoFa.verifySecretKey(admin.secretKey,ctx.request.body.token)
            //    if(!tokenVerifed)
            //    {
            //   return  ctx.body =  {login:{
            //            status:0,
            //            message:"Token Mismatch"
            //        }}
            //    }
               
            // }
                const matched=await UtilServices.comparePassword(password,admin.password);
                if(matched){
                console.log(admin.accountDelete);
                if(admin.accountDelete){
                    return ctx.body =  {signin:{
                        status:0,
                        message:"Account deleted please signup with new email if you want to use this platform"
                    }}
                }
                let additionalMessage='';
                if(!admin.accountActive){
    
                const record = await ctx.db.admins.update(
                {
                accountActive: true,
                },
                {
                where: {
                    id:admin.id
                }
               });
               if (record[0]==1){
                additionalMessage=" and Account reactivated"
                }
                 
               }
              const token =  JwtServices.issue({
                 payload:{
                      admin:admin.id
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
                [Op.iLike]: `${ctx.request.body.userEmail}%`
              }
        }});
    },async viewUser(ctx){

    },
    async allApplications(ctx){

        ctx.body=  await ctx.verificationApplicaitons.findAll({
            where:{
                status:"Review Pending"
            }
        });
    }

};

