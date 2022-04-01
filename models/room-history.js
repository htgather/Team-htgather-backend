const mongoose = require('mongoose')

const roomHistorySchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
        },
        creator: {
            type: String,
        },
        roomTitle: {
            type: String,
        },
        videoTitle: {
            type: String,
        },
        videoLength: {
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
        maxPeopleNumber: {
            type: Number,
        },
        secret: {
            type: Boolean,
        },
        deletedAt: {
            type: Date,
        },
        completed: {
            type: Boolean,
        },
    },
    { timestamps: true }
)

roomHistorySchema.set('toJSON', {
    virtuals: true,
})

module.exports = mongoose.model('RoomHistory', roomHistorySchema)
