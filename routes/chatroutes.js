
// const Router = require('koa-router');
// const router = new Router();
// const isAuthenticated= require('./../policies/isAuthenticated');
// const isAuthenticatedAdmin= require('./../policies/isAuthenticatedAdmin');
    const chatcontroller =  require('./../controllers/chat.controller');
const JwtService = require('./../utils/jwt.service');
module.exports=function(io){
    io.on('connection',(socket)=>{
        var query = socket.handshake.query;
        socket.join(query.roomName);
        
        console.log("new user connected");
        socket.on('newMessage',(msg)=>{
            console.log(msg);
        });

        let text='';
        socket.on('createMessage', (message,callback) => {
            console.log("message:",message.data);
            text=message.data.data
            // const decodedToken = JwtService.verify(message.token);
            // if(!decodedToken) {
            //    return ctx.body={
            //         authorization:{
            //             status : 0,
            //             message:"token expired or malformed."
            //         }
            //     }
            // }

            socket.broadcast.to(message.data.conversationId).emit('newMessage', {text,
                room:message.data.conversationId,
                sender:message.data.sender,
                type:message.data.type,
                message:message.data.data
                  }
            ); 
            callback({messagesent:{
                status:1,
                message:'message delivered',
                text
                

            }});
    
          });
          socket.on('newImage', (message,callback) => {
           
      
    
            socket.broadcast.to(message.conversationId).emit('newImage', {
                message:message.url
                ,
                room:message.conversationId,
                type:message.type,
                sender:message.sender,

            
            
            }
            ); 
            callback({messagesent:{
                status:1,
                message:'message delivered',
                text
            }});
    
          });


    });   
}
  


// router.get('/localtrade/chat',(ctx)=>{

// });


// module.exports = router;