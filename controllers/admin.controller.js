// const UtilServices =  require('./../utils/util.service');
// const JwtServices = require('./../utils/jwt.service');

module.exports={

    async addCurrency(ctx){
        ctx.body = await ctx.db.supportedTokens.create({
            name : ctx.request.body.name,
            symbol: ctx.request.body.symbol
        });

        

    },
};

