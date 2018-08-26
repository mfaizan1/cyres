const koa = require("koa");
const bodyParser = require("koa-parser");
const db= require("./models");
const router = require("./routes/routes");
const chatRouter = require('./routes/chatroutes')
const koaBody = require('koa-body');
const cors = require('koa2-cors');
const http = require('http');
const socketio =  require('socket.io');
const PORT = process.env.PORT||8000;

const app = new koa();
app.use(cors());
app.use(koaBody({ multipart: true}));
app.use(bodyParser());
app.use(router.routes());
// app.use(chatRouter.routes());

db.sequelize.sync({force:false}).
then(()=>console.log("table generated")).
catch((err)=>console.log(err))
app.context.db=db;
const server = http.createServer(app.callback());
const io = socketio(server);
app.context.io = io


server.listen(PORT,function(){
    console.log(`listening oooon ${PORT}`);
});
