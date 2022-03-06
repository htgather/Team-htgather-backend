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
            type: Number,
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
        category: {
            type: String,
        },
        difficulty: {
            type: String,
        },
        numberOfPeopleInRoom: {
            type: Number,
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
