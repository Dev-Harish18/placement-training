const Event=require('../models/Event')
const User = require('../models/User')

exports.addEvent=async function(req,res){
    let {title,link,type,hint} = req.body
    const errors=req.errors
    if(errors.length > 0){
        req.flash('errors',errors)
        await req.session.save()
        req.flash("data", {title,link,type,hint});
        await req.session.save();
        return res.redirect('/events/add')
    }
    
    const event = await Event.create({
        title:title.toLowerCase(),
        type,
        question:link,
        hint:hint.toLowerCase()
    })

    await event.save()
    req.flash('success',`New ${type} has been created`)
    await req.session.save()
    res.redirect('/')
}

exports.validate=async (req,res,next)=>{
    const {title,link,hint}=req.body;
    let errors=[];
    const event=await Event.findOne({title:title.toLowerCase()})
    if(event){
        errors.push("This title has already been taken")
    }
    else if(!link.startsWith('http')){
        errors.push("Invalid Link")
    }
    else if(/[^\w,\(\)]/.test(hint)){
        errors.push('Hints can contain only alphabets,numbers,comma,underscores and square brackets')
    }
    
    req.errors=errors
    next()
}
exports.editEvent=async (req,res)=>{ 
    const {title,question,hint}=req.body
    let errors=[]
    if(!question.startsWith('http')){
        errors.push('Invalid Link')
    }
    else if(/[^\w,\(\)]/.test(hint)){
        errors.push('Hints can contain only alphabets,numbers,comma,underscores and square brackets')
    }
    if(errors.length>0){
        req.flash('errors',errors)
        await req.session.save()
        return res.redirect(`/events/${req.params.type}/edit/${title.toLowerCase().split(' ').join('-')}`)
    }
    const event=await Event.findOne({type:req.params.type,title:req.params.title.split('-').join(" ")})
    event.title=title.toLowerCase()
    event.question=question
    event.hint=hint.trim()
    await event.save()
    req.flash('success',`${req.params.type} has been updated successfully`)
    await req.session.save()
    res.redirect('/')
}
exports.getAllEvents=async function(req,res){
    const user=req.user;
    const name=user?user.name.split(" ")[0]:undefined
    const role=user?user.role:undefined
    let finalObj=[]
    let attendedEvent
    const events = await Event.find({type:req.params.type})
    events.forEach(async event=>{
        for(i of user.events){
            if(i.id==event.id){
                attendedEvent=i
            }
        }
        
        const slug=event.title.toLowerCase().split(" ").join("-")
        if(attendedEvent && attendedEvent.attended==true){
            finalObj.push({title:event.title,type:event.type,date:String(event.date).split(" "),attended:true,slug})
        }else{
            finalObj.push({title:event.title,type:event.type,date:String(event.date).split(' '),attended:false,slug})
        }
        attendedEvent=undefined
    })
   
    res.render('allEvents',{name,role,data:finalObj,type:req.params.type})
}

exports.viewStats=async function(req,res){
    const user=req.user;
    const name=user?user.name.split(" ")[0]:undefined
    const role=user?user.role:undefined
    const event=await Event.findOne({title:req.params.title.split('-').join(" ")})
    let attended=[],unattended=[]
    const allUsers=await User.find()
    for(let i=0;i<allUsers.length;i++){
        let user=allUsers[i]
        let found=false
        if(user.events.length==0){
            unattended.push({name:user.name,roll:user.roll,activeTime:'Nil'})
            continue;
        }
        for(let i=0;i<user.events.length;i++){
            let evt=user.events[i]
            if(String(evt.id)==String(event._id)){
                if(evt.attended==true){
                    found=true
                    attended.push({name:user.name,roll:user.roll,activeTime:evt.activeTime})
                    break;
                }
            }
        }
        if(found===false)
            unattended.push({name:user.name,roll:user.roll,activeTime:'Nil'})
    }
    res.render('dashboard',{
        attended,unattended,name,role
    })
}