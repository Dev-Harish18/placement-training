const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const router = require("./router");
const bodyParser = require("body-parser");

//Configuring .env file
require("dotenv").config();

//db configuration
const connectionString = process.env.MONGO_CONNECTION_STRING;
mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Db connection Successful"));
mongoose.Promise = global.Promise;
const db = mongoose.connection;

//Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
    store: new MongoStore({
      mongooseConnection: db,
    }),
  })
);
app.use(express.static("public"));
app.use(flash());
app.set("view engine", "ejs");
app.set("views", "./views");
//Router Mounting
app.use("/", router);
//Invalid Routes
app.get('*',function(req,res){
  const err=new Error('Page Not Found')
  err.status=404
})
//Global Error handling middleware
app.use(async function(err,req,res,next){
  err.status=err.status||500
  err.message=err.message||"Something went wrong,try again"
  if(err.status==404){
    return res.redirect('/error')
  }
  req.flash('errors',err.message)
  await req.session.save()
  res.redirect('/')
})
//Making server to Listen
app.listen(process.env.PORT||3000, () => {
  console.log("App running in port 3000");
});

module.exports = app;
