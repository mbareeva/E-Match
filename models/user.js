const mongoose = require("mongoose"),
  mongoosastic = require("mongoosastic"),
  passportLocalMongoose = require("passport-local-mongoose"),
  Media = require("../models/media");
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
    ref: "Media",
    es_type: 'nested',
    es_include_in_parent: true

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

//  *****  Retrieve auth credentials from bonsai elasticsearch add-on  ***** //
const auth = process.env.BONSAI_AUTH || "";
const port = process.env.BONSAI_PORT || "9200";
const protocol = process.env.BONSAI_PROTOCOL || "";
const host = process.env.BONSAI_HOST || "localhost";

// ***** connect to elasticsearch using mongoosastic plugin ***** 
userSchema.plugin(mongoosastic, {
  "host": host,
  "port": port,
  "auth": auth,
  "protocol": protocol,
  populate: [
    { path: 'latestMedia', select: "caption likes commentCount" }
  ]
});

//  ***** Password hashing and storage. username as the user login parameter  ***** //
userSchema.plugin(passportLocalMongoose);

let User = mongoose.model('User', userSchema);

//  ***** create a mapping  ***** 
User.createMapping((err, mapping) => {
  console.log('** elasticsearch mapping created for Users');
})


module.exports = mongoose.model("User", userSchema);