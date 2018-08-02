var speakeasy = require('speakeasy');

var secret = speakeasy.generateSecret({length: 15});
console.log(secret.base32);