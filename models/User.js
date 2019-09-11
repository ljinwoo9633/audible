const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    follower: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    follower_number: {
        type: Number,
        default: 0
    },
    follow: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    my_audios: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    upload_audios: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    like: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ]
})

module.exports = mongoose.model('User', UserSchema);