const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
    {
        creator: {
            type: String,
        },
        roomTitle: {
            type: String,
        },
        videoThumbnail: {
            type: String,
        },
        videoLength: {
            type: String,
        },
        videoUrl: {
            type: String,
        },
        videoTitle: {
            type: String,
        },
        videoStartAfter: {
            type: Number,
        },
        videoStartAt: {
            type: String,
        },
        category: {
            type: String,
        },
        difficulty: {
            type: String,
        },
        numberOfPeopleInRoom: {
            type: Number,
        },
        isStart: {
            type: Boolean,
        },
    },
    { timestamps: true }
)

roomSchema.virtual('roomId').get(function () {
    return this._id.toHexString()
})

roomSchema.set('toJSON', {
    virtuals: true,
})

module.exports = mongoose.model('Room', roomSchema)
