const User=require('../models/User')
const Event=require('../models/Event')

exports.saveResponse=async function(req,res){
    const {type,activeTime,title}=req.body;
    const user=await User.findOne({_id:req.session.userId})
    const event=await Event.findOne({title:title.toLowerCase()})
    user.events.push({id:event._id,attended:true,activeTime})
    await user.save()
    req.flash('success','Your response has been recorded')
    await req.session.save()
    res.status(200).json({
        message:"success"
    })
}
