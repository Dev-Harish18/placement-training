const User=require("../models/User") 
const bcrypt=require("bcryptjs")

exports.signup = async function (req, res, next) {
  const { name, roll, email, password, rpassword } = req.body;
  const errors = req.errors;
  
  //Check for Errors
  if (errors.length > 0) {
    req.flash("data", { name, roll, email, password, rpassword });
    await req.session.save();

    req.flash("errors", errors);
    await req.session.save();
    return res.redirect("/users/signup");
  }

  //If no Errors

  //Password hashing
  const salt=bcrypt.genSaltSync(14)
  const hashedPassword=bcrypt.hashSync(password,salt)

  //Creating a user
  const user=await User.create({
    name,roll,email,password:hashedPassword
  })

  //Saving to db
  await user.save()

  //Flash message
  req.flash("success","Sign Up Successful")
  await req.session.save()
  req.session.userId=user._id;
  res.redirect('/')
  next();
};


exports.signin=async (req,res)=>{
const {email,password}=req.body

try{
  const user=await User.findOne({email})
    if(user && bcrypt.compareSync(password,user.password)){
      req.session.userId=user._id
      req.flash("success","Login Successful")
      await req.session.save()
      return res.redirect('/')
    } 
    else{
      req.flash("signInData",{email,password})
      await req.session.save()
      req.flash("errors","Invalid Email/Password")
      await req.session.save()
      return res.redirect('/users/signin')
    }
}catch(e){
  console.log("Login err:",e)
}
}

exports.signout=async (req,res)=>{
await req.session.destroy()
res.redirect("/")  
}

exports.validate = async function (req, res, next) {
  const { name, roll, email, password, rpassword } = req.body;
  const namePattern = /^[a-z A-Z]+$/;
  const emailPattern = /^[a-z0-9]+@[a-z]+\.[a-z]+$/;
  const rollPattern = /^[0-9]{4}[Ll0-9][0-9]{2}$/;
  const numPattern = /[0-9]/g;
  const stringPattern = /[a-zA-Z]/g;
  let errors = [];

  if (!namePattern.test(name))
    errors.push("Name should contain only alphabets");
  if (!emailPattern.test(email)) errors.push("Email is invalid");
  if (!rollPattern.test(roll)) errors.push("Roll No. is invalid");
  if (password.length < 8) errors.push("Password Must alteast 8 characters");
  else if (!numPattern.test(password) || !stringPattern.test(password))
    errors.push("Password should contain alteast 1 Alphabet and 1 Number");
  if (password !== rpassword) errors.push("Entered Passwords Does not Match");


  //Account Already Exits
  const user = await User.findOne({email})
  if(user){
    errors.push("This Email has already been taken")
  }

  req.errors = errors;
  next();
};

exports.resetPassword=async (req,res)=>{
  const numPattern = /[0-9]/g;
  const stringPattern = /[a-zA-Z]/g;
  const {email,password,rpassword}=req.body
  const user=await User.findOne({email})
  let errors=[]
  if (password.length < 8) errors.push("Password Must alteast 8 characters");
  else if (!numPattern.test(password) || !stringPattern.test(password))
    errors.push("Password should contain alteast 1 Alphabet and 1 Number");
  else if(user){
    if(password===rpassword){
      const salt=bcrypt.genSaltSync(14)
      const hashedPassword=bcrypt.hashSync(password,salt)
      user.password=hashedPassword
      req.flash("forgotPasswordData",{email,password,rpassword})
      await user.save()
      req.flash("success","Password has been reset successfully")
      await req.session.save()
      return res.redirect('/')
    } 
    else if(!user){
      errors.push("Entered Passwords do not match")
    }
  }else{
    errors.push("User does not exist")
  }
  req.flash("errors",errors)
  await req.session.save()
  res.redirect("/users/forgotPassword")
}

exports.mustBeLoggedIn=async function(req,res,next){
  if(req.session && req.session.userId){
    const user = await User.findOne({_id:req.session.userId})
    req.user=user
    next()
  }
  else{
    const err=new Error('You should be logged in to do this task')
    err.status=401
    next(err)
  }
}

exports.restrictToAdmins=async function(req,res,next){
  const user=await User.findOne({_id:req.session.userId})
  if(user.role==="admin"){
    next()
  }
  else{
    const err=new Error('Only Admins are allowed to perform this task')
    err.status=403
    next(err)
  }
}