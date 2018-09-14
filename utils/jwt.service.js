const jwt =  require('jsonwebtoken');
const config = require('../config/config.json');
module.exports={

    issue(payload,expiresIn){
        return jwt.sign(payload,config.development.secret,{
            expiresIn:expiresIn
        })
    },verify(token){
        try{
        // console.log(jwt.verify(token,config.development.secret));
        return jwt.verify(token,config.development.secret);
    }catch(err){
        return false;
    }
    }
}