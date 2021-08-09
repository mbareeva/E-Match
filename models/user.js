const mongoose = require("mongoose"),
  mongoosastic = require("mongoosastic"),
  //const passport = require("passport");
  //passportLocalMongoose = require("passport-local-mongoose");
  //create a mongoDB model for the mapping


  userSchema = mongoose.Schema({
    fullname: String,
    biography: String,
    followers_count: Number,
    follows_count: Number,
    website: String,
    specialisation: String,
    interest: String,
    location: {
      type: String
    },
    latestMedia: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media"
    }],
    username: {
      type: String,
      required: true,
      unique: true
    },
    matches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    role: {
      type: String,
      enum: ["business", "influencer"]
    }
  });

// get the full name of the candidate.
userSchema.virtual('fullName')
  .get(function () {
    return `${this.name.firstname} ${this.name.lastname}`;
  });

const auth = process.env.BONSAI_AUTH || "";
const port = process.env.BONSAI_PORT || "9200";
const protocol = process.env.BONSAI_PROTOCOL || "";
const host = process.env.BONSAI_HOST || "localhost";

//connect to elasticsearch using mongoosastic plugin
userSchema.plugin(mongoosastic, {
  "host": host,
  "port": port,
  "auth": auth,
  "protocol": protocol,
});

let User = mongoose.model('User', userSchema);
//create a mapping
User.createMapping((err, mapping) => {
  console.log('** elasticsearch mapping created for Users');
})


module.exports = mongoose.model("User", userSchema);