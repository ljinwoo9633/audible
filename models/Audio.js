const mongoose = require('mongoose');

const AudioSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    like: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    upload_number: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    source: {
        type: mongoose.Schema.Types.ObjectId
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    like_number: {
        type: Number,
        default: 0
    },
    coverImage: {
        type: Buffer,
    },
    coverImageType: {
        type: String,
    }
})

AudioSchema.virtual('coverImagePath').get(function() {
    if (this.coverImage != null && this.coverImageType != null) {
      return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
  })

global.Audio = global.Audio || mongoose.model('Audio', AudioSchema);
module.exports = global.Audio;