
const aws = require("./../utils/uploadAws");
const shortid =  require('shortid');
const requestify = require('requestify');

module.exports = {

async check(ctx){


    try{
        const app = await ctx.db.verificationApplication.findOne({
            where:{
                traderId:ctx.state.trader,
                status:true
            }
        })
        if(app!=null){
            ctx.body={application:{
                status:0,
                message:"already submitted , redirecting to profile page "
            }}
        }


    }catch(err){
        console.log(err);
    }

},
async generateCode(ctx){
try{


    const prevRecord =  await ctx.db.verificationApplication.findOne({
        where:{
            traderId:ctx.state.trader
        }
    });
    console.log("prevrecord->",prevRecord)
    if(prevRecord!=null){
        var token = Math.floor(1000 + Math.random() * 9000);
        const tokenRecord = ctx.db.verificationApplication.update({
            phonenumber : ctx.request.body.number,
            code : token
        },{
            where:{
                traderId:ctx.state.trader
            }
        })
        if (tokenRecord!=null){

     await requestify.get(`http://sendpk.com/api/sms.php?username=923078712115&password=7495&sender=CYRES&mobile=${ctx.request.body.number}&message=Your verification code for Cyres seller application is ${token}`)
            .then(function (response) {
                // Get the response body (JSON parsed or jQuery object for XMLs)
                console.log(response.getBody());

                if(response.getBody().indexOf("OK ID") !== -1){
                ctx.body = {
                    code:{
                        status:1,
                        message:"verification code has been sent to you mobile"
                    }
                }
                }else{
                    ctx.body = {
                        code:{
                            status:0,
                            message:"Please Enter valid phone number"
                        }
                    }
                }
            }
            );
                }
                else{
                    ctx.body = {
                        code:{
                            status:0,
                            message:"Erorr in send code please retry in some time"
                        }
                    }
                }
    }else{
    var token = Math.floor(1000 + Math.random() * 9000);
    const tokenRecord = ctx.db.verificationApplication.create({
        phonenumber : ctx.request.body.number,
        code : token,
        traderId:ctx.state.trader
    })
    console.log("tokenRecord ->",tokenRecord);
    if (tokenRecord!=null){

await requestify.get(`http://sendpk.com/api/sms.php?username=923427111995&password=3762&sender=CYRES&mobile=${ctx.request.body.number}&message=Your verification code for Cyres seller application is ${token}`)
.then(function (response) {
    // Get the response body (JSON parsed or jQuery object for XMLs)
    console.log(response.getBody());

    if(response.getBody().indexOf("OK ID") !== -1){
    ctx.body = {
        code:{
            status:1,
            message:"verification code has been sent to you mobile"
        }
    }
    }else{
        ctx.body = {
            code:{
                status:0,
                message:"Please Enter valid phone number"
            }
        }
    }

}
);
    }
    else{
        ctx.body = {
            code:{
                status:0,
                message:"Erorr in send code please retry in some time"
            }
        }
    }
    }


}catch(err){
console.log(err)
}
},
async submit(ctx){
try {
    let {body} = ctx.request;
    const previousApplication = await ctx.db.verificationApplication.findOne({
        where :{
            traderId:ctx.state.trader
        }
    });
    if(previousApplication!=null){
        
        const application =  await ctx.db.verificationApplication.findOne({
            where:{
                phonenumber:body.number,
                traderId:ctx.state.trader
            }
        });
if(application==null){
    ctx.body =  {verificationApplication:{
        status:0,
        message:"Please send code to you mobile first."
    }}
}else {
    if(application.code == body.code){
        const updateApplication = await ctx.db.verificationApplication.update({
            fullname:body.fullname,
            country:body.country,
            stateOrProvince:body.stateOrProvince,
            city:body.city,
            phonenumber:body.number,
            status:true
        },{
            where :{
                traderId:ctx.state.trader
            }
        });
        if (updateApplication){
            ctx.body =  {verificationApplication:{
                status:1,
                message:"Verification application submited"
            }}
        }


    }else{
        ctx.body =  {verificationApplication:{
            status:0,
            message:"invalid code! please enter correct code"
        }}
    }
}


    }else {
        ctx.body =  {verificationApplication:{
            status:0,
            message:"Please send code to you mobile first."
        }}
    }
}
catch(err){
console.log(err);
}
}
,
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

                for (var KeyVal in files) {
                    var item = files[KeyVal];
                    console.log('item ',item)
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

    
                }
  
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
}
}