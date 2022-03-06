const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
    {
        creator: {
            type: String,
            required: true,
        },
        roomTitle: {
            type: String,
            required: true,
        },
        videoThumbnail: {
            type: String,
            required: true,
        },
        videoLength: {
            type: Number,
            required: true,
        },
        videoUrl: {
            type: String,
            required: true,
        },
        videoTitle: {
            type: String,
            required: true,
        },
        videoStartAfter: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            required: true,
        },
        numberOfPeopleInRoom: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
)

roomsSchema.virtual('roomsId').get(function () {
    return this._id.toHexString()
})

roomSchema.set('toJSON', {
    virtuals: true,
})

module.exports = mongoose.model('Room', roomSchema)
