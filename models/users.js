const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  nickName: {
    type: String,    
    default: "",
  },
  snsId: {
    type: String,    
    default: "",
  },
});

usersSchema.virtual("usersId").get(function () {
  return this._id.toHexString();
});

usersSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("User", usersSchema);
