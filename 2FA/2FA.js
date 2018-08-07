var speakeasy = require('speakeasy');

const secretkey=()=>{
    var secret = speakeasy.generateSecret({length: 15});
    console.log(secret.base32);
    return secret.base32;
}
