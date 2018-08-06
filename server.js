const koa = require("koa");
const bodyParser = require("koa-parser");
const db= require("./models");
const router = require("./routes/routes");
const koaBody = require('koa-body');
const cors = require('koa2-cors');

const PORT = process.env.PORT||8000;

const app = new koa();
app.use(cors());
app.use(koaBody({ multipart: false}));
app.use(bodyParser());
app.use(router.routes());

db.sequelize.sync({force:false}).
then(()=>console.log("table generated")).
catch((err)=>console.log(err))
app.context.db=db;
app.listen(PORT);
console.log(`server started on port ${PORT}`);
