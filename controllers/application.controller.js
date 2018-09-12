const fs = require('fs');
const path = require('path');
const aws = require("./../utils/uploadAws");
const shortid =  require('shortid');
module.exports = {

async submitApplication(ctx){
    let {body, files} = ctx.request;
        try{
        if ('POST' != ctx.method) return await next();

    const previousApplication = await ctx.db.verificationApplication.findOne({
        where :{
            traderId:ctx.state.trader
        }
    });
if(previousApplication!==null){
    const allPictures = await ctx.db.applicationPictures.findAll({
        where :{
            verificationApplicationId:previousApplication.id
        }
    });


    await ctx.db.applicationPictures.destroy({
        where:{
            verificationApplicationId:previousApplication.id
        }
    });
    await ctx.db.verificationApplication.destroy({
        where:{
            id:previousApplication.id
        }
    });
}
     const application   =   await ctx.db.verificationApplication.create({
            fullname:ctx.request.body.fullname,
            country:ctx.request.body.country,
            stateOrProvince:ctx.request.body.stateOrProvince,
            city:ctx.request.body.city,
            cardNumber:ctx.request.body.cardNumber,
            traderId:ctx.state.trader
        });


   

            if (application !== null) {
                const trader = await ctx.db.traders.findOne({
                    where: {
                        id: ctx.state.trader
                    }
                });
        
                const files = ctx.request.files;
                for (var KeyVal in files) {
                    var item = files[KeyVal];
                    console.log(`item : ${item}`)
            
                    const { key, url } = await  aws.uploadFile({
                        filePath: item.path,
                        fileType: item.path,
                        key: `applications/${trader.id}/${application.id}/${shortid.generate()}`,
                    });

                    ctx.db.applicationPictures.create({
                        path: url,
                        verificationApplicationId: application.id
                    });
                }

                // for (var key in files) {
                //     var item = files[key];
                //     console.log("hey"+files[key])
                //     const { key, url } = await  aws.uploadFile({
                //         filePath: files[key].path,
                //         fileType: files[key].path,
                //         key: `applications/${trader.id}/${application.id}/${shortid.generate()}`,
                //     });

                //     ctx.db.applicationPictures.create({
                //         path: url,
                //         verificationApplicationId: application.id
                //     });
          
                }
        
            // }
ctx.body = {verificationApplication:{
    status:1,
    message:"Application submitted successfully"
}}


//match
        }
catch(err){
    console.log(err);
ctx.body = {verificationApplication:{
    status:0,
    message:"some problem happend please try again"
}
}

}

//match
}

}