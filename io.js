var sio = require('socket.io');
var io = null;

exports.io = function () {
  return io;
};

exports.initialize = function(server) {
  io = sio(server);
console.log('io',io)
  io.on('connection', function(socket) {
    console.log("user connected from seprate file");
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
            message:message.data.message
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
            message:message.url ,
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
};