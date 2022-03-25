const mongoose = require('mongoose')

const workOutTimeSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
        },
        workOutTime: {
            type: Number,
        },
        category: {
            type: String,
        },
        videoUrl: {
            type: String,
        },
    },
    { timestamps: true }
)

workOutTimeSchema.virtual('workOutTimeId').get(function () {
    return this._id.toHexString()
})

workOutTimeSchema.virtual('doneAt').get(function () {
    return this.createdAt
})

workOutTimeSchema.set('toJSON', {
    virtuals: true,
})

module.exports = mongoose.model('WorkOutTime', workOutTimeSchema)
