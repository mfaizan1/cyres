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
    
        return ctx.db.sequelize.transaction(function (t) {
            // chain all your queries here. make sure you return them.
            return  ctx.db.supportedTokens.create({
                name : ctx.request.body.name,
                symbol: ctx.request.body.symbol
            }, {transaction: t}).then(function (supportedTokens) {
              return ctx.db.ExchangeWallets.create({
                supportedTokenId:supportedTokens.id,
                balance:0
              }, {transaction: t});
            });
          
          }).then(function (result) {
              ctx.body= {addcoin:{status:1,message:"coin added"}}
           }).catch(function (err) {
            ctx.body= {addcoin:{status:0,message:"couldn't add coin"}}
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

        await ctx.db.sequelize.query('select "traders"."name","traders"."email","traders"."emailVerified","traders"."accountActive","traders"."accountDelete","traders"."localTradeActive","traders"."twoFAActive","traders"."secretKey","Wallets"."balance" from "traders"  \
        full outer join "Wallets" on "Wallets"."traderId" = "traders"."id" \
        full outer join "supportedTokens" on  "supportedTokens"."id" = "Wallets"."supportedTokenId" \
        where "traders"."id" =  :id ',{replacements:{
            id:ctx.request.body.traderId
        }}).spread((results, metadata) => {
            console.log(results);
          ctx.body=results;
      });

    },
    async allApplications(ctx){

        ctx.body=  await ctx.db.verificationApplication.findAll({
            where:{
                status:"Review Pending"
            }
        });
    },
    async application(ctx){

        await ctx.db.sequelize.query('select * from "verificationApplications" join "applicationPictures" on "verificationApplications"."id" = "applicationPictures"."verificationApplicationId" where "verificationApplications"."id" = :id',{replacements:{
            id:ctx.request.body.applicationId
        },type:ctx.db.sequelize.QueryTypes.SELECT}).then(applicationdata=>{
            ctx.body=applicationdata;
        });


        // ctx.body =  await ctx.db.verificationApplication.findOne({
        //     where:{
        //         id:ctx.request.body.applicationId
        //     }
        // })
    },
    async approveApplication(ctx){

        try{

            await ctx.db.verificationApplication.update({
                status:"Verified",
                reason:ctx.request.body.comment
            },
            {where:{
                id:ctx.request.body.applicationId
            }}
        );
            ctx.body={approveApplication:{
                status:1,
                message: 'Application approved'
            }}
        }catch(err){
            ctx.body={approveApplication:{
                status:0,
                message: 'update failed'
            }}
        }
        
    },
    async rejectApplication(ctx){
try{

    await ctx.db.verificationApplication.update({
        status:"Rejected",
        reason:ctx.request.body.comment
    },
    {where:{
        id:ctx.request.body.applicationId
    }}
);
    ctx.body={rejectApplication:{
        status:1,
        message: 'Application rejected'
    }}
}catch(err){
    ctx.body={rejectApplication:{
        status:0,
        message: 'update failed'
    }}
}

    },
    async deleteUser(ctx){

       const result= await  ctx.db.traders.update({
            accountDelete:true
        },
     {   where:{
        id:ctx.request.body.traderId
        }
    });
    if (result[0]==1){
        ctx.body={
            deleteuser:{
                status:1,
                message:"User Deleted Successfully"
            }
        }
        }else{
            ctx.body={
                deleteuser:{
                    status:0,
                    message:"Unable to delete user, try again."
                }
            }
        }
    },async withdraws(ctx){
        ctx.body = await ctx.db.Withdraws.findAll({
            where:{
                adminApproved:false
            }
        })

    },
    async approveWithdraw(ctx){
        try{
            const update =  await ctx.db.Withdraws.update({
                adminApproved:true
            },{
                where:{
                    id: ctx.request.body.withdrawId
                }
            })
            if(update){
                return ctx.body= {
                    approveWithdraw:{
                        status:1,
                        message:"approved"
                    }
                
                }
            }

        }catch(err){
            return ctx.body= {
                approveWithdraw:{
                    status:0,
                    message:"could not approve"
                }
            
            }
        }


        
    },async rejectWithdraw(ctx){
        try{
            const update =  await ctx.db.Withdraws.update({
                adminApproved:true
            },{
                where:{
                    id: ctx.request.body.withdrawId
                }
            })
            if(update){
                return ctx.body= {
                    approveWithdraw:{
                        status:1,
                        message:"rejected"
                    }
                
                }
            }
        }catch(err){
            return ctx.body= {
                approveWithdraw:{
                    status:0,
                    message:"could not reject"
                }
            
            }
        }

    }
    

};

