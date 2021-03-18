const express = require("express");
const router = express.Router();
const authController = require("./controllers/authController");
const userController=require('./controllers/userController');
const eventController=require('./controllers/eventController')
const User = require("./models/User");
const Event=require("./models/Event")

router.route("/").get(home);
router.route("/users/signin").get(signin).post(authController.signin);
router.route("/users/signout").get(authController.signout);
router
  .route("/users/signup")
  .get(signup)
  .post(authController.validate, authController.signup);
router.route("/users/forgotPassword").get(forgotPass);
router.route("/users/resetPassword").post(authController.resetPassword);
router.get("/events/:type/getall",authController.mustBeLoggedIn,eventController.getAllEvents);
router.get("/events/:type/get/:title", authController.mustBeLoggedIn,getEvent);
router.route("/events/:type/edit/:title")
      .get(authController.mustBeLoggedIn,authController.restrictToAdmins,editEvent)
      .post(eventController.validate,eventController.editEvent);
router.post("/events/response",userController.saveResponse)
router.route("/events/add")
      .get(authController.mustBeLoggedIn,authController.restrictToAdmins,addEvent)
      .post(eventController.validate,eventController.addEvent)
router.get("/events/:type/view-stats/:title",authController.mustBeLoggedIn,authController.restrictToAdmins,eventController.viewStats)
router.get('/error',error)

//Rendering Functions
async function home(req, res) {

  let user;
  if(req.session && req.session.userId){
    user = await User.findById({_id:req.session.userId})
  }
  const errors=req.flash("errors");
  const success=req.flash("success");
  const name=user?user.name.split(" ")[0]:undefined
  const role=user?user.role:undefined

  res.render("index",{
    errors,success,name,role
  });
}
function signup(req, res) {
  let data = req.flash("data");
  const errors=req.flash("errors")
  if (data.length === 0)
    data = [
      {
        name: "",
        roll: "",
        email: "",
        password: "",
        rpassword: "",
      },
    ];
  res.render("signup", {
    errors,
    data,
  });
}
function signin(req, res) {
  const errors=req.flash("errors")
  let data = req.flash("signInData");
  if (data.length === 0)
    data = [
      {
        email: "",
        password: "",
      },
    ];

  res.render("signin",{errors,data});
}
function forgotPass(req, res) {
  const errors=req.flash("errors")
  let data = req.flash("forgotPasswordData");
  if (data.length === 0)
    data = [
      {
        email: "",
        password: "",
        rpassword:""
      },
    ];

  res.render("forgotPassword",{errors,data});
}

function addEvent(req,res){
  let data = req.flash("data");
  const errors=req.flash('errors')
  if (data.length === 0)
  data = [
    {
      title: "",
      link: ""
    },
  ];
  res.render('addEvent',{
    errors,data
  })
}

async function editEvent(req,res){
  const title=req.params.title.split('-').join(" ")
  const errors=req.flash('errors')
    const event=await Event.findOne({type:req.params.type,title})
    res.render('editEvent',{
        title:event.title,
        question:event.question,
        type:event.type,
        hint:event.hint,
        slug:req.params.title,
        errors
    })
}

async function getEvent(req, res) {
  const user=req.user;
  const name=user?user.name.split(" ")[0]:undefined
  const role=user?user.role:undefined
  let title=req.params.title.split('-').join(' ').toUpperCase()
  
  const event=await Event.findOne({title:title.toLowerCase()})
  if(!event){
    return res.redirect('/error')
  }
  const hint=event.hint.split(",").sort()
  res.render("event",{
    name,role,title,type:req.params.type,link:event.question,hint
  });
}

function error(req,res){
  res.render('error')
}
module.exports = router;
