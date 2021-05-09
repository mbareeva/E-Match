const mongoose = require("mongoose");
//const passport = require("passport");
//passportLocalMongoose = require("passport-local-mongoose");
//create a mongoDB model for the mapping


userSchema = mongoose.Schema({
    name: {
        firstname: {
            type: String,
            trim: true
        },
        lastname: {
            type: String,
            trim: true
        }
    },
    location: {
        type: String
    },
    latestMedia:[
      {
        caption: {
          type: String
        },
        hashtags: [{
          type: String
        }]
      }
    ],
    username: {
      type: String,
      required: true
    },
    email: {
        type: String,
        lowercase: true,
    },
    matches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
});

// get the full name of the candidate.
userSchema.virtual('fullName')
    .get(function () {
        return `${this.name.firstname} ${this.name.lastname}`;
    });

// userSchema.plugin(passportLocalMongoose, {
//     usernameField: "email"
// });

// const auth = process.env.BONSAI_AUTH || "";
// const port = process.env.BONSAI_PORT || "9200";
// const protocol = process.env.BONSAI_PROTOCOL || "";
// const host = process.env.BONSAI_HOST || "localhost";
// //connect to elasticsearch using mongoosastic plugin
// userSchema.plugin(mongoosastic, {
//     "host": host,
//     "port": port,
//     "auth": auth,
//     "protocol": protocol,
// });



//create a mapping
// User.createMapping((err, mapping) => {
//     console.log('** elasticsearch mapping created for Users');
// })

var User = mongoose.model('User', userSchema);
module.exports = mongoose.model("User", userSchema);