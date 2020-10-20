const mongoose=require("mongoose")


const miscSchema=new mongoose.Schema({
    id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Event'
    },
    attended:{
        type:Boolean,
        default:false
    },
    activeTime:{
        type:String,
        default:"-1"
    }
})
const userSchema=new mongoose.Schema({
    name:String,
    roll:Number,
    email:String,
    password:String,
    events:[miscSchema],
    role:{
        type:String,
        default:"student"
    }
})

const User=mongoose.model('User',userSchema)

module.exports=User