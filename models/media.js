const mongoose = require("mongoose"),
  mediaSchema = mongoose.Schema({
    caption: String,
    likes: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  });

module.exports = mongoose.model("Media", mediaSchema);