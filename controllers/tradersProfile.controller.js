const UtilServices =  require('./../utils/util.service');
const JwtServices = require('./../utils/jwt.service');
const twoFa =  require('./../2FA/twoFa');
module.exports ={
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
         await ctx.db.traders.findOrCreate({where: {email}, 
            defaults: {name,password:hashpassword}})
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
            console.log("token incoming"+ ctx.request.body.token)
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
                  trader:trader.id,
                  role:'trader'
          }
        },'3h');

        let message = `Signin successful${additionalMessage}`

        console.log("issue token "+token);
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
async ViewAccountDetails(ctx){
 try{
    ctx.body  =await ctx.db.traders.findOne({
        where :{
          id: ctx.state.trader
        },
        attributes:
            ['name','email','emailVerified','localTradeActive','twoFAActive']
        
    });
 }catch(err){
    ctx.throw(err,"can get user details");
 }
},
async editAccountDetails(ctx){
    try{
        ctx.body= await ctx.db.traders.findOne({
            where :{
              id: ctx.state.trader
            },
            attributes:
                ['name']
        });
     }catch(err){
        ctx.throw(err,"can get user details");
     }
},

async saveAccountDetails(ctx) {
    try {
        const record = await ctx.db.traders.update(
            {
                name:   ctx.request.body.name,
            },
            {
            where: {id: ctx.state.trader}
           });
          if(record===0){
            ctx.body= {
                changessaved: {
                satus : 0,
            }}
          }else{
            console.log(record);
            ctx.body= {
                changessaved: {
                satus : 1,
                newName: ctx.request.name
            }};
          }
    } catch (err) {
        ctx.throw(500, err)
    }
},
async editPassword(ctx){
    try{
        let {oldpassword,newpassword}=ctx.request.body;
   
        const trader  =await ctx.db.traders.findOne({
            where :{
              id:ctx.state.trader
            }
        });

        if (trader === null){
          return  ctx.body= {passwordchange:
             { status:0,
            message: "No such user found"
        }
          
  };
        }
      const matched=await UtilServices.comparePassword(oldpassword,trader.password);
      if(matched){
        const hashpassword=await UtilServices.hashPassword(newpassword);
        const record = await ctx.db.traders.update(
            {
            password:   hashpassword,
            },
            {
            where: {id: ctx.state.trader
            }
           });
           
           ctx.body={passwordchange:{status:1,message:"password changed succesfully"}};
      }else {
              ctx.body={    passwordchange:{
                  satus:0,
                  message: "Old password is  incorrect"
              }};
      }
      }catch(err){
  ctx.throw(500,err);
      }
},
async forgetPassword(ctx){
    
    ctx.body = "forget password";
},
getSecretKey(ctx){
    ctx.body={ getSecretKey:{
       secretkey: twoFa.getSecretKey(),
       status:1,
       message:"here is your secret key"
    } 
    }

},
async enable2FA(ctx){
    try{
     const verified =   twoFa.verifySecretKey(ctx.request.body.secretkey,ctx.request.body.token);
     console.log(verified);
     if(verified){
     await ctx.db.traders.update({
         twoFAActive:true,
         secretKey:ctx.request.body.secretkey
     },{where:{
         id:ctx.state.trader
     }})
     ctx.body={enable2FA:{
        status:1,
        message:"2FA enabled"
    }
 }
    }
     else{
        ctx.body={enable2FA:{
            status:0,
            message:"Code mismatch, please enter correct code"
        }
     }
    }
}
    catch(err){
        console.log(err);
        ctx.body={enable2FA:{
            status:0,
            message:"please retry"
        }

        }
    }

},
async disable2FA(ctx){
    try{

        const trader  = await ctx.db.traders.findOne({
            where :{
                id : ctx.state.trader
            }
        });
        if(trader === null ){
            return ctx.body = { disable2FA:{
                status:0,
                message:"no such User"
            }

            }
        }
        const verified =   twoFa.verifySecretKey(trader.secretKey,ctx.request.body.token);
        if(verified){
        await ctx.db.traders.update({
            twoFAActive:false,
            secretKey:"none"
        },{where:{
            id:ctx.state.trader
        }})
        ctx.body={enable2FA:{
           status:1,
           message:"2FA disabled"
       }
    }
       }
        else{
           ctx.body={enable2FA:{
               status:0,
               message:"Code mismatch, please enter correct code"
           }
        }
       }
   }
       catch(err){
           console.log(err);
           ctx.body={enable2FA:{
               status:0,
               message:"please retry"
           }
   
           }
       }
   
},
async disableAccount(ctx){
    try{

        
        let {password}=ctx.request.body;
    
        const trader  =await ctx.db.traders.findOne({
            where :{
              id:ctx.state.trader
            }
        });
        if (trader === null){
          return  ctx.body= {
              accountDisable:{
              status:0,
              message : "Disabling account failed due to authencticaton failure"
          }      
  };
        }
      const matched=await UtilServices.comparePassword(password,trader.password);
    
      if(matched){
        const record = await ctx.db.traders.update(
            {
            accountActive: false,
            },
            {
            where: {
                id: ctx.state.trader
            }
           });

           if (record[0]==1){
            ctx.body= {accountDisable:{
                status:1,
                message : "Account disabled successful"}
            }
            }else {
                ctx.body= {accountDisable:{
                    status:0,
                    message : "Disabling account failed"
                }  
            }  
           }
      } else {
       ctx.body= {accountDisable:{
            status:0,
            message : "Disabling account failed due to authencticaton failure"
        }     };
      }
      }catch(err){
  ctx.throw(500,err);
      }
  
},
async deleteAccount(ctx){
    try{
        let {password}=ctx.request.body;
    
        const trader  =await ctx.db.traders.findOne({
            where :{
              id:ctx.state.trader
            }
        });
        if (trader === null){
          return  ctx.body= {
              accountDisable:{
              status:0,
              message : "Disabling account failed due to authencticaton failure"
          }      
  };
        }
      const matched=await UtilServices.comparePassword(password,trader.password);
    
      if(matched){
        const record = await ctx.db.traders.update(
            {
            accountDelete: true,
            },
            {
            where: {
                id: ctx.state.trader
            }
           });

           if (record[0]==1){
            ctx.body= {accountDelete:{
                status:1,
                message : "Account deleted successfuly"}
            }
            }else {
                ctx.body= {accountDelete:{
                    status:0,
                    message : "Deleting account failed"
                }  
            }  
           }
      } else {
       ctx.body= {accountDelete:{
            status:0,
            message : "Deleting account failed due to authencticaton failure"
        }     };
      }
      }catch(err){
  ctx.throw(500,err);
      }
},
async changeLocalSelling(ctx){
    try{
        let {password,localSellingState}=ctx.request.body;
    
        const trader  =await ctx.db.traders.findOne({
            where :{
              id:ctx.state.trader
            }
        });

        const application =  await ctx.db.verificationApplication.findOne({
            where:{
                traderId: ctx.state.trader
            }
        });
        if(application === null){
            ctx.body={localSellingChange:{
                satus:0,
                message:"Please submit verification application before enabling local selling."
            }}

        }else if (application.status==="Review Pending"){
            ctx.body={localSellingChange:{
                satus:0,
                message:"Your application is under review please wait till it is approved."
            }}
        }else if (application.status==="rejected"){
            ctx.body={localSellingChange:{
                satus:0,
                message:"Your application has been rejected due to following reason.",
                reason:application.reason
            }}
        }else {

        if (trader === null){
          return  ctx.body= {
              localSellingChange:{
              status:0,
              message : "Local selling status change failed due to authencticaton failure"
          }      
  };
        }
      const matched=await UtilServices.comparePassword(password,trader.password);
      if(matched){
        const record = await ctx.db.traders.update(
            {
            localTradeActive: localSellingState,
            },
            {
            where: {
                id: ctx.state.trader
            }
           });

           if (record[0]==1){
            ctx.body= {
                localTradeChange:{
                status:1,
                message : "Local trade status changed successfully"}
            }
            }else {
                ctx.body= {localTradeChange:{
                    status:0,
                    message : "Local change query failed."
                }  
            }  
           }
      } else {
       ctx.body= {localTradeChange:{
            status:0,
            message : "Changing status failed due to authenticaiton failure."
        }     };
      }
      }
    }catch(err){
  ctx.throw(500,err);
      }
},
checkParameters(parameter){
    if (typeof parameter !== 'undefined') {
        return true;
    }
   else if (typeof parameter === 'undefined') {
        return false;
    }
}

};
