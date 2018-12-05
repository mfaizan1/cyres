const koa = require("koa");
const bodyParser = require("koa-parser");
const db= require("./models");

const koaBody = require('koa-body');
const cors = require('koa2-cors');
const http = require('http');
// const localtrade =  require('./controllers/localtrade.controller');

const PORT = process.env.PORT||8000;

const app = new koa();
app.use(cors());
app.use(koaBody({ multipart: true}));
app.use(bodyParser());

// app.use(chatRouter.routes());

db.sequelize.sync({force:false}).
then(()=>console.log("table generated")).
catch((err)=>console.log(err))
app.context.db=db;
const server = http.createServer(app.callback());


// var io = require('./io').initialize(server);

module.exports.server = server;
module.exports.io = require('socket.io')(server,{origins:'*:*'});


require('./controllers/trading.controller');

require('./routes/chatroutes');

const router = require("./routes/routes");
app.use(router.routes());
// setInterval(localtrade.getLocaltrades, 30000);
server.listen(PORT,function(){
    console.log(`listening oooon ${PORT}`);
});
