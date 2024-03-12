const mongoose = require('mongoose')

const storySchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    caption:{
        type:String,
    },
    image:{
        type:String,
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
    ],
    date:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('story', storySchema)