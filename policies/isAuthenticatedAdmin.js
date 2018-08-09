const JwtService = require('./../utils/jwt.service');
module.exports = async (ctx,next) => {
    let token ='';
    if(ctx.request.headers && ctx.request.headers.authorization){
        token= ctx.req.headers.authorization;
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
    const admin  = await ctx.db.admin.findOne({ where: {id: decodedToken.payload.admin} });
    if (admin){
        ctx.state.admin = admin.id;
          await next();
    }
    else {
        ctx.throw(401,"unauthorized");
    }
};