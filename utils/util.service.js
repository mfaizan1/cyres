const bcrypt = require('bcrypt');
const SALT_ROUND=10;

module.exports={
     
    async hashPassword(password){
    try{
    const hash=await bcrypt.hash(password,SALT_ROUND);
    return hash;
    }catch(err)
    {
        throw err;

}
    },
    async comparePassword (password,hash){
        try{
            return await bcrypt.compare(password,hash);
        }catch(err)
        {
            throw err;
    
    }
        },


};