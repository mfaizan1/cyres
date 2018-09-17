const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const aws = require("./../utils/uploadAws");
const shortid = require('shortid');
const chatsocket =  require("./../routes/chatroutes");

module.exports={
    async sendImage(ctx){
        try{
          let {body, files} = ctx.request;
            if(files.file.type == 'image/jpg' ||files.file.type == 'image/png' || files.file.type == 'image/jpeg'  ){
            const { key, url }    = await  aws.uploadFile({
              filePath:files.file.path,
              fileType:files.file.type,
              key:`conversations/${body.conversationId}/${shortid.generate()}`
          });
          console.log(key,url);
            if (key==0 && url == 0){
                return   ctx.body={imagesend:{
                    status:0,
                    message: "unable to upload to server"
                }
 
                }
                
            }else{
                 const conversation = await ctx.db.conversation.findOne({where:{
        id : ctx.request.body.conversationId
    }});
    if(conversation.userOneId === ctx.state.trader || conversation.userTwoId === ctx.state.trader){
        let reciver=null;
        if(conversation.userOneId === ctx.state.trader ){
        reciver=conversation.userTwoId;
        }else{
            reciver=conversation.userOneId;
        }
            const message =  await ctx.db.messages.create({
            type:"image",
            data:url,
            conversationId:ctx.request.body.conversationId,
            senderId: ctx.state.trader,
            recieverId:reciver
        });
       const sender = ctx.db.traders.findOne(
            {   attributes:['name'],
                where:{
            id:message.senderId
        }})
        if(message){
       return ctx.body={imagesend:{
        status:1,
        statusMessage:"image saved",
        message:message.data,
        sender:sender.name,
        type:'image'
}}
        }else{
            return ctx.body={imagesend:{
                status:0,
                message:"can't save in databse",
        }}
        }
            }
        }
            }else{
               ctx.body={imagesend:{
                   status:0,
                   message: "You can only send png or jpeg file"
               }
               }
            }
        } catch(err){
            console.log(err);
            ctx.body={imagesend:{
                status:0,
                message: "something went wrong please try again"
            }

            }
        } 
  
      },
      async prevMessages(ctx){

        ctx.body = await ctx.db.messages.findAll({
       
            attributes:['type',['data','message'],'createdAt',['senderId','senderName']],
            where:{
                conversationId:ctx.request.body.conversationId
            }
        })
      }
      ,
async findConversations(ctx){
    console.log("trader"+ctx.state.trader)
    const conToSearch = [];
    const conToSend=[];
        const conversations = await ctx.db.conversation.findAll({

            where:{
            [Op.or]: [{userOneId: ctx.state.trader},{userTwoId:ctx.state.trader}]
        }
        });
    for (var key in conversations) {
        if (conversations.hasOwnProperty(key)) {
           if(conversations[key].userOneId == ctx.state.trader){
            // conToSearch.push(conversations[key].userTwoId );
            conToSearch.push({user:conversations[key].userTwoId , conversationId:conversations[key].id})
           }else if (conversations[key].userTwoId == ctx.state.trader){
                // conToSearch.push(conversations[key].userOneId);
                conToSearch.push({user:conversations[key].userOneId , conversationId:conversations[key].id})

           }
        }
     }
     console.log("cons to search",conToSearch)
     for (var key in conToSearch) {
         await ctx.db.sequelize.query('select  "traders"."name" , "conversations"."id" as "conversationId" , "messages"."createdAt" \
          from public.traders \
         join "conversations" on "traders"."id" = "conversations"."userOneId" \
         or \
         "traders"."id" = "conversations"."userTwoId" \
         join "messages" on "messages"."conversationId" = "conversations"."id" \
         where "traders"."id" = :traderId and conversations.id = :conversationId\
         order by "messages"."createdAt" desc limit 1',{replacements:{
         traderId:conToSearch[key].user,
         conversationId:conToSearch[key].conversationId
         }}).spread((results, metadata) => {
            conToSend.push(results);
            //  details =results;
       });
    }

    ctx.body= conToSend;


},

async createOrFindConversation(ctx){
    try{
        const user = await ctx.db.traders.findOne({where:{
            id:ctx.request.body.traderId
        }});
        if(user === null){
            ctx.body = {
                findCoversation:{
                    status:0,
                    message:"no such user"
                }
            }
        }


    await ctx.db.conversation.findOrCreate({
        where:{
            [Op.or]: [{userOneId: ctx.state.trader,userTwoId:ctx.request.body.traderId}, {userTwoId: ctx.state.trader,userOneId:ctx.request.body.traderId}]
        } ,
            defaults:{
                userOneId:ctx.state.trader,
                userTwoId:ctx.request.body.traderId,
                deleted:'false'
            } 
       
    }).spread((conversation, created) => {
        console.log(conversation.get({
          plain: true
        }));
        console.log(created);
        ctx.body={findCoversation:{
         status:1,
        conversationId:conversation.id
        }
    }
      });
    

}catch(err){
    ctx.body={findCoversation:{
        status:0,
    message:"unable to find or create conversation id"
       }
   }
}

},
async insertMessage(ctx){
    try{

        let messageSend = {} 
    const conversation = await ctx.db.conversation.findOne({where:{
        id : ctx.request.body.conversationId
    }});
    if(conversation.userOneId === ctx.state.trader || conversation.userTwoId === ctx.state.trader){
        let reciver=null;
        if(conversation.userOneId === ctx.state.trader ){
        reciver=conversation.userTwoId;
        }else{
            reciver=conversation.userOneId;
        }
        return ctx.db.sequelize.transaction(function (t) {

            // chain all your queries here. make sure you return them.
            return ctx.db.messages.create({
                type:ctx.request.body.type,
                data:ctx.request.body.message,
                conversationId:ctx.request.body.conversationId,
                senderId: ctx.state.trader,
                recieverId:reciver
            }, {transaction: t})
            .then(function (message) {
                // messageSend.status=1
                // messageSend.type= message.type;
                // messageSend.message=message.data;
                // messageSend.conversationId.conversationId;
                return ctx.db.traders.findOne(
                    {   attributes:['name'],
                        where:{
                    id:message.senderId
                }},{transaction:t})
            });
          }).then(function (sender) {
              console.log(sender.name);
              messageSend.status = 1;
              messageSend.sender=sender.name;
              messageSend.type=ctx.request.body.type;
              messageSend.message=ctx.request.body.message;
              messageSend.conversationId=ctx.request.body.conversationId;
              messageSend.senderId=ctx.state.trader;
              messageSend.reciverId=reciver;
                ctx.body = messageSend;
          }).catch(function (err) {
                ctx.body = {
                    messageSend:{
                        status:0,
                        message:"couldn't send message"
                    }
                }
            // Transaction has been rolled back
            // err is whatever rejected the promise chain returned to the transaction callback
          });
    }
}catch(err)
{
    console.log(err);
    ctx.body={messagesave:{
        status:0,
        message:"databse issue"
    }}
}
}
}