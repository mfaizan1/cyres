const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const aws = require("./../utils/uploadAws");
var shortid = require('shortid');

module.exports={
    async sendImage(ctx){
        try{
          let {body, files} = ctx.request;
            if(files.file.type == 'image/jpg' ||files.file.type == 'image/png' || files.file.type == 'image/jpeg'  ){
            const { key, url }    = await  aws.uploadFile({
              filePath:files.file.path,
              fileType:files.file.type,
              key:`onversations/${body.conversationId}/${shortid.generate()}`
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
        if(message){
       return ctx.body={imagesend:{
        status:1,
        message:"image saved",
        data:message.data,
        type:'image',
}}
        }else{
            return ctx.body={imagesend:{
                status:0,
                message:"can't save in databse",
                data:message.data,
                type:'image',
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
            where:{
                conversationId:ctx.request.body.conversationId
            }
        })
      }
      ,
async findConversations(ctx){

    const conToSearch = [];
    const conToSend=[];
        const conversations = await ctx.db.conversation.findAll({

            where:{
            [Op.or]: [{userOneId: ctx.state.trader},{userTwoId:ctx.state.trader}]
        }
        });
        console.log(conversations);

    for (var key in conversations) {
        if (conversations.hasOwnProperty(key)) {
           console.log(conversations[key].userOneId , conversations[key].userTwoId);
           if(conversations[key].userOneId == ctx.state.trader){
            // conToSearch.push(conversations[key].userTwoId );
            conToSearch.push({user:conversations[key].userTwoId , conversationId:conversations[key].id})
           }else if (conversations[key].userTwoId == ctx.state.trader){
                // conToSearch.push(conversations[key].userOneId);
                conToSearch.push({user:conversations[key].userOneId , conversationId:conversations[key].id})

           }
        }
     }
     for (var key in conToSearch) {
         console.log("s"+ conToSearch[key].user +" "+conToSearch[key].conversationId);
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
            type:ctx.request.body.type,
            data:ctx.request.body.message,
            conversationId:ctx.request.body.conversationId,
            senderId: ctx.state.trader,
            recieverId:reciver
        });
        if(message){
        ctx.body={messagesave:{
         status:1,
        message:"message saved"
}}
        }
    }else {
        ctx.body={messagesave:{
            status:0,
            message:"wrong credentials"
        }}
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