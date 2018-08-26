
// const Router = require('koa-router');
// const router = new Router();
// const isAuthenticated= require('./../policies/isAuthenticated');
// const isAuthenticatedAdmin= require('./../policies/isAuthenticatedAdmin');
module.exports=function(io){
    io.on('connection',(socket)=>{
        console.log("new user connected");
        socket.on('newMessage',(msg)=>{
            console.log(msg);
        });
    });   
}
  


// router.get('/localtrade/chat',(ctx)=>{

// });


// module.exports = router;