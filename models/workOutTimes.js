const mongoose = require("mongoose");

const workOutTimesSchema = new mongoose.Schema({
  userId: {
    type: String,    
    default: "",
  },
  doneAt: {
    type: Date,    
    default: "",
  },
  workOutTime: {
    type: Number,    
    default: "",
  },
},
{ timestamps: true }
);

workOutTimesSchema.virtual("workOutTimesId").get(function () {
  return this._id.toHexString();
});

workOutTimesSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("WorkOutTimes", workOutTimesSchema);
