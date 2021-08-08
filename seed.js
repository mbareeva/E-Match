// File: seed.js
// Fucntionality: Seed the fake data to the database.
// Data: The data includes the information about influencers: profile info and media data of the user.

const mongoose = require("mongoose"),
  mongoosastic = require("mongoosastic"),
  Media = require("./models/media"),
  User = require("./models/user"),
  data = require("./scraper/cleaned.json");
//data = [{ "fullname": "Wild 'N Out", "biography": "The official Instagram account for Wild 'N Out \ud83c\udfa4 Catch all-new episodes airing Tuesdays at 8pm on VH1 \ud83d\udca5 Follow \ud83d\udc47 for FULL clips \ud83d\udcfa", "followers_count": 6380400, "follows_count": 144, "website": "http://www.paramountplus.com/?ftag=PPM-05-10aeh6j", "profileCategory": 2, "specialisation": "", "location": "", "username": "mtvwildnout", "role": "influencer", "latestMedia": [{ "caption": "I have never heard that many jokes related to shoes before. They wouldn't give @thekingcannon a break. \ud83e\udd23 #WildNOut", "likes": 185823 }, { "caption": "@iamkelmitchell let it be known just how crafty he is with words. \ud83d\ude02 #WildNOut", "likes": 69295 }, { "caption": "Not the \u201cI went to school with this dude\u201d. \ud83d\ude2d #WildNOut", "likes": 194678 }, { "caption": "@conceitednyc said he was getting that point either way! \ud83d\ude2d\ud83e\udd23 #WildNOut", "likes": 121749 }, { "caption": "They really had to pull this man @dcyoungfly off the stage. \ud83e\udd23 #WildNOut", "likes": 162662 }, { "caption": "He came to SHOW UP & SHOW OUT, you can't tell him nothing. \ud83e\udd23\ud83d\ude33 #WildNOut", "likes": 89988 }, { "caption": "@darrenbrand_ didn't come to play in this imaginary kitchen. \ud83e\udd23 #WildNOut", "likes": 110190 }, { "caption": "Once the first person messed up, it was ALL downhill from there. \ud83d\ude05\ud83d\ude02 #WildNOut", "likes": 74172 }, { "caption": "@iam_kingbobbej was clever with that one! \ud83d\ude2d #WildNOut", "likes": 208295 }, { "caption": "There's always that one person that adds flavor with bacon grease. \ud83d\ude02 #WildNOut", "likes": 95435 }, { "caption": "@therealcharlieclips had the flow, but she couldn\u2019t guess the right job. \ud83d\ude2d #WildNOut", "likes": 66401 }, { "caption": "@yvngswag and @thebsimone skipped the small talk and got straight to the point! \ud83d\ude33\ud83d\ude02", "likes": 83447 }] }, { "fullname": "Casey Cott", "biography": "That's coconuts you're super delightful.", "followers_count": 5084638, "follows_count": 667, "website": "http://bit.ly/bppricematch", "profileCategory": 3, "specialisation": "", "location": "", "username": "caseycott", "role": "influencer", "latestMedia": [{ "caption": "Spent this summer\u2019s off time from Riverdale road tripping through the States! While usually it takes us six exits to decide where to fill up our car, BPme Price Match is a GAME CHANGER. (AD)\n \nI downloaded the app, subscribed for 99 cents and, now, I have a price match guarantee on gas prices from any station within a half mile.\n \nI've been doing price matching for more than a decade -- before there were even apps for it. My mom and I would keep track of the lowest prices and text each other whenever we found something better. Trust me, the BPme app is way easier. Find a bp or Amoco station, fill up and save! @bp_plc\n \nSwipe to look through photos from my trip, and click the link in my bio to download the app!", "likes": 254815 }, { "caption": "Happy 30th Birthday to my partner in crime, can\u2019t wait to spend the next 30 years of life with you.", "likes": 540867 }, { "caption": "Uni or Stache", "likes": 259742 }, { "caption": "\ud83d\ude0d\ud83d\ude0d\ud83d\ude0d", "likes": 279677 }, { "caption": "My Valentine\u2019s Day post is better than your Valentine\u2019s Day post.", "likes": 766264 }, { "caption": "Happy Birthday Drew", "likes": 680080 }] }, { "fullname": "gameofthrones", "biography": "The @HBO original series is now streaming on @HBOMax. Follow @HouseoftheDragonHBO for all updates on the prequel to #GameofThrones.", "followers_count": 8533097, "follows_count": 58, "website": "https://bit.ly/3tuuQmj", "profileCategory": 3, "specialisation": "TV Show", "location": "", "username": "gameofthrones", "role": "influencer", "latestMedia": [{ "caption": "She is no Lady.", "likes": 182845 }, { "caption": "Battle of the Bastards.", "likes": 627597 }, { "caption": "Dracarys.", "likes": 308305 }, { "caption": "A girl is ready for anything.", "likes": 301590 }, { "caption": "Raise a glass to Lord Eddard Stark this Father\u2019s Day.", "likes": 497736 }, { "caption": "The things I do for love.", "likes": 207507 }, { "caption": "\u201cWe mothers do what we can to keep our sons from the grave.\u201d Happy Mothers Day to every Queen, warrior, and Mother of Dragons.", "likes": 208479 }, { "caption": "Fire & blood. \nThe @HBO original series @HouseoftheDragonHBO, coming to @HBOMax in 2022.", "likes": 761043 }, { "caption": "Fire will reign \ud83d\udd25 The @HBO original series #HouseoftheDragon is officially in production. Follow @HouseoftheDragonHBO for all updates.", "likes": 317447 }, { "caption": "Prepare to charge.\n#GameofThrones director and #HouseoftheDragon co-showrunner Miguel Sapochnik breaks down the Battle of the Bastards. #IronAnniversary", "likes": 80357 }, { "caption": "A Collection Has No Name.\nFollow in Arya\u2019s footsteps with a curated list of episodes to #MaraThrone (via link in bio).", "likes": 47433 }, { "caption": "The true enemy brings the storm.\nStream the most epic battles and memorable one-on-one duels Game of Thrones has to offer (via link in bio). #MaraThrone", "likes": 47883 }] }]

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
 * Finds the user's media content, create it and saves it into DB.
 * @param {Object} arr The array of user profiles.
 *  @param {Object} user The user that has media content in the profile.
 */
let addMedias = async (arr, user) => {
  //find user
  let thisUser = arr.find(userProf => userProf.username = user.username)
  let mediaData = thisUser.latestMedia.map(async media => {
    let mediaParams = {
      caption: media.caption,
      likes: media.likes,
      commentsCount: media.commentsCount
    }
    return await new Media(mediaParams).save()
  })
  return await Promise.all(mediaData).catch(error => {
    console.error("Error in media: ", error.message)
  });

}

/**
 * Creates the user and saves it into the DB.
 * @param {Object} arr The array of user profiles.
 */
let addUsers = async (arr) => {
  let usersData = arr.map(async user => {
    let userParams =
    {
      fullname: user.fullname,
      biography: user.biography,
      followers_count: user.followers_count,
      website: user.website,
      profileCategory: user.profileCategory,
      specialisation: user.specialisation,
      location: user.location,
      username: user.username,
      role: user.role
    }
    let newUser = await new User(userParams).save();
    let medias = await addMedias(arr, user);
    let updatedUser = await User.findOneAndUpdate({ username: user.username }, { $addToSet: { latestMedia: medias } }, { new: true })
    return updatedUser
  })
  return await Promise.all(usersData).catch(error => {
    console.error(error.message)
  });
}

deleteAll();
addUsers(data).then(result => {
  console.log("Users were created. The total number is: ", result.length)
  mongoose.connection.close()
})


