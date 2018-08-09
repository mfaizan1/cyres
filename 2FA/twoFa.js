var speakeasy = require("speakeasy");
module.exports={
getSecretKey(){
    var secret = speakeasy.generateSecret({length: 12});
    console.log(secret.base32);
    return secret.base32;
}, verifySecretKey(base32secret,userToken){
    return speakeasy.totp.verify({ secret: base32secret,
        encoding: 'base32',
        token: userToken });
}


};