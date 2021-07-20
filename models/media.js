const mongoose = require("mongoose"),
  mongoosastic = require("mongoosastic"),
  mediaSchema = mongoose.Schema({
    caption: String,
    likes: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
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
});

let Media = mongoose.model('Media', mediaSchema);
Media.createMapping((err, mapping) => {
  console.log('** elasticsearch mapping created for Medias');
})

module.exports = mongoose.model("Media", mediaSchema);