const mongoose=require('mongoose')

const eventSchema=new mongoose.Schema({
    title:String,
    type:String,
    question:String,
    key:String,
    date:{
        type:Date,
        default:Date.now
    }
})

const Event=mongoose.model('Event',eventSchema)
module.exports=Event