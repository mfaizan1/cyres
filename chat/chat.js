module.exports = function(io){

    io.on('connection',(socket)=>{
        console.log("new user connected");
socket.on('join',(params,callbak)=>{
    socket.join(params.room);
    callbak();

});
    
        socket.on('createMessage', (message,callback) => {
            console.log(message.text);
            io.to(message.room).emit('newMessage', {text: message.text,
            room:message.room}); 
            callback();
          });
    });
    
}