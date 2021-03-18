const User=require('../models/User')
const Event=require('../models/Event')

exports.saveResponse=async function(req,res){
    const {type,activeTime,title}=req.body;
    let found=false
    const user=await User.findOne({_id:req.session.userId})
    const event=await Event.findOne({title:title.toLowerCase()})
    for(let i=0;i<user.events.length;i++){
        let evt= user.events[i]
        if(String(evt.id)===String(event._id)){
            found=true
            evt.activeTime=activeTime
            break;
        }
    }
    if(!found)
        user.events.push({id:event._id,attended:true,activeTime})
    await user.save()
    req.flash('success','Your response has been recorded')
    await req.session.save()
    res.status(200).json({
        message:"success"
    })
}
