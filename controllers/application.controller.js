const fs = require('fs');
const path = require('path');

module.exports = {

async submitApplication(ctx){

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
    Object.keys(allPictures).forEach(function(key){

        fs.unlink(allPictures[key].path, (err) => {
            if (err) throw err;
            console.log(`${allPictures[key].path} deleted`);
          });
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
        if(application!==null){
    const trader = await ctx.db.traders.findOne({
where :{
    id:ctx.state.trader
}
    });
    let  uploadPath=null;

    try {
        fs.mkdirSync(`./uploads/${trader.email}`);
        uploadPath = `./uploads/${trader.email}`;
      } catch (err) {
        if (err.code === 'EEXIST'){
        uploadPath = `./uploads/${trader.email}`;
        } else{
           throw err 
        }
      }
      const files = ctx.request.files;
         Object.keys(files).forEach(function(key){
             
      
            const reader = fs.createReadStream(files[key].path);
            const finalPath=path.join(uploadPath ,files[key].name)
            const stream = fs.createWriteStream(finalPath);
            reader.pipe(stream).on('finish',()=>{
    
                ctx.db.applicationPictures.create({
                    path:   finalPath,
                    verificationApplicationId:application.id
                });
            });
            

        });
}
ctx.body = {verificationApplication:{
    status:1,
    message:"Application submitted successfully"
}}

}catch(err){
ctx.body = {verificationApplication:{
    status:0,
    message:"some problem happend please try again"
}}
}

}
}