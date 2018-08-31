const JwtService = require('./../utils/jwt.service');
module.exports = async (ctx,authToken,next) => {
    let token ='';
    console.log(authToken);
    if(data.auth ){
        token= authToken
    }else{
        ctx.throw(400,"headers not set");
    }
    const decodedToken = JwtService.verify(token);
    if(!decodedToken) {
       return ctx.body={
            authorization:{
                status : 0,
                message:"token expired or malformed."
            }
        }
    }
    const trader  = await ctx.db.traders.findOne({ where: {id: decodedToken.payload.trader} });
    if (trader){
        ctx.state.trader = trader.id;
          await next();
    }
    
    else {
        ctx.throw(401,"unauthorized");
    }
};