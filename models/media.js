const mongoose = require("mongoose"),
  mongoosastic = require("mongoosastic"),
  User = require("../models/user");
mediaSchema = mongoose.Schema({
  caption: String,
  likes: Number,
  commentCount: Number,
  keywords: [{
    type: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    es_type: 'nested',
    es_include_in_parent: true
  }
});

const auth = process.env.BONSAI_AUTH || "";
const port = process.env.BONSAI_PORT || "9200";
const protocol = process.env.BONSAI_PROTOCOL || "";
const host = process.env.BONSAI_HOST || "localhost";

mediaSchema.plugin(mongoosastic, {
  "host": host,
  "port": port,
  "auth": auth,
  "protocol": protocol,
  populate: [
    { path: 'user', select: "username _id followers_count biography specialisation location" }
  ]
});

let Media = mongoose.model('Media', mediaSchema);
Media.createMapping((err, mapping) => {
  console.log('** elasticsearch mapping created for Medias');
  console.log("***port: ", process.env.BONSAI_PORT)
})

module.exports = mongoose.model("Media", mediaSchema);