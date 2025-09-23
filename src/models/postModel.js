import mongoose, {Schema} from 'mongoose'

const postSchema= new Schema({
    by:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    media:{
        type:[],   //array of the image of the gcp bucket
        required:true
    },
    caption:{
        type:String,
        trim:true
    },
    status:{
        type:String,
        enum:['draft','uploaded'],
        default:'draft'
    },
    likes:[{
        type:Schema.Types.ObjectId,
        ref:'User',
        default:[]
    }],
    taskId:{
        type:Schema.Types.ObjectId,
        ref:'Task',
        default:null
    },

},{timestamps:true})

export const Post=mongoose.model('Post',postSchema)