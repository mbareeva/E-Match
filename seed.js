// File: seed.js
// Fucntionality: Seed the fake data to the database.
// Data: The data includes the information about influencers: profile info and media data of the user.

const mongoose = require("mongoose"),
  mongoosastic = require("mongoosastic"),
  Media = require("./models/media"),
  User = require("./models/user");
data = require("./scraper/vectors.json");
const media = require("./models/media");
const use = require('@tensorflow-models/universal-sentence-encoder');

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/e-match",
  { useNewUrlParser: true }
)
mongoose.set('useFindAndModify', false);

mongoose.connection;

//////////////////// *** FUNCTIONS *** /////////////////////////

/**
 * Deletes all the entries in the database
 * before seeding it with a new dataset.
 */
let deleteAll = () => {
  User.deleteMany()
    .exec()
    .then(() => {
      console.log("User data is empty!")
    })

  Media.deleteMany()
    .exec()
    .then(() => {
      console.log("Media data is empty!")
    })
}

/**
 * Creates the user and saves it into the DB.
 * @param {Object} arr The array of user profiles.
 */
let addUsers = (arr) => {
  let data = [];
  let usersData = arr.forEach(user => {
    let userParams =
    {
      fullname: user.fullname,
      biography: user.biography,
      followers_count: user.followers_count,
      website: user.website,
      interest: user.interest,
      specialisation: user.specialisation,
      location: user.location,
      username: user.username,
      unit_vector: user.unit_vector,
      role: user.role
    }
    new User(userParams).save().then(newUser => {
      //loop throught media in the given fake data.
      let allCaptions = "";
      user.latestMedia.forEach(m => {
        let mediaParams = {
          caption: m.caption,
          likes: m.likes,
          commentCount: m.commentsCount || typeof m.commentsCount !== 'undefined' ? m.commentsCount : (Math.floor(Math.random() + (300 - 20 + 1) + 20))
        }
        allCaptions += m.caption + ",";

        //create Media
        new Media(mediaParams).save().then(media => {
          //set the owner of the media
          Media.findOneAndUpdate({ _id: media._id }, { $set: { user: newUser } }, { new: true }).then(updatedMedia => {
            //push updated media to the array of total media items.
            //medias.push(updatedMedia);
            User.findOneAndUpdate({ username: newUser.username }, { $addToSet: { latestMedia: updatedMedia } }, { new: true }).then(result => {

            }).catch(error => {
              console.error(error.message)
            });
          }).catch(error => {
            console.error(error.message)
          });
        })
      })
    })
      .catch(error => {
        console.error(error.message)
      });
  })
  return data;
}

deleteAll()
addUsers(data)

