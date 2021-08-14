const User = require("../models/user");
const Media = require("../models/media")
const axios = require('axios');
const INSTA_URL_GRAPH = 'https://graph.facebook.com/v10.0/oauth/access_token';
const redirectUri = 'https://e-match-htw.herokuapp.com/handleauth';
const appId = process.env.APP_ID;
const appSecret = process.env.APP_SECRET;

getUserParams = (body) => {
  return {
    fullname: body.fullname,
    biography: body.biography,
    followers_count: body.followers_count,
    follows_count: body.follows_count,
    website: body.website,
    specialisation: body.specialisation,
    interest: body.interest,
    location: body.location,
    username: body.username,
    role: body.role
  }
};

exports.getStart = (req, res) => {
  res.render('index', {
    userFB: res.locals.userFB,
    appId: appId,
    redirectUri: redirectUri
  });
}

exports.login = (req, res) => {
  res.redirect("/auth/facebook");
}

/**
 * Exchanges the generated code for a token 
 * that will allow the access to user's data e.g.
 * user id, username and media data.
 */
exports.getAccess = async (req, res) => {
  try {
    let code = req.query;
    req.session.code = code;
    //Request of access token for further requests
    var config = {
      method: 'get',
      url: INSTA_URL_GRAPH + '?code=' + code.code
        + '&client_id=' + appId
        + '&redirect_uri=' + redirectUri
        + '&client_secret=' + appSecret
    };
    let user_data = await axios(config)
    req.session.access_token = user_data.data.access_token;
    let token = req.session.access_token;
    console.log("Access token: ", req.session.access_token);

    let facebookPages = await getPageId(token);
    let pageID = facebookPages.data.data.find(e => e.id);
    let instaBusinessAccount = await getInstagramUserId(pageID.id, token);
    req.session.user_id = instaBusinessAccount.data.instagram_business_account.id;
    let userId = req.session.user_id;

    let personalBusinessData = await getAllProfileData(userId, token);

    let mediaIdData = await getAllMediaId(userId, token);
    let mediaDetailedInfo = await getAllMediaData(mediaIdData.data.data, token);
    req.session.media = mediaDetailedInfo;
    console.log("MEDIA", mediaDetailedInfo)
    req.session.user = personalBusinessData.data;
    console.log("USER", req.session.user)
    res.locals.userFB = personalBusinessData.data;
    res.render('index');
  } catch (err) {
    console.log('Error: ', err);
  }
}

exports.loginViaFacebook = (req, res) => {
  res.redirect("/auth/facebook");
}

exports.create = (req, res) => {
  let userData = req.session.user;
  let user;
  console.log("User info: ", userData)
  if (userData) {

    user = new User({
      fullname: userData.fullname,
      biography: userData.biography,
      followers_count: userData.followers_count,
      follows_count: userData.follows_count,
      website: userData.website,
      specialisation: req.body.specialisation,
      interest: req.body.interest,
      location: req.body.location,
      username: userData.username,
      role: req.body.role
    });
    console.log("Specialisation: ", req.body.specialisation)
    console.log("user: ", req.body.password)
    User.findOne({ username: user.username }).then(user => {
      if (!user) {
        User.register(user, req.body.password).then((user) => {
          let mediaArrForUser = [];
          console.log("NEw user: ", user)
          let savedMedia = req.session.media;
          if (savedMedia) {
            savedMedia.forEach(e => {
              //fill the Media object with data from Instagram.
              let mediaContent = new Media({
                caption: e.caption,
                likes: e.like_count,
                commentCount: e.comment_count
              });
              mediaContent.save();
              mediaArrForUser.push(mediaContent);
            });

            User.findOneAndUpdate({ _id: user._id }, { $addToSet: { latestMedia: mediaArrForUser } }, { new: true })
              .then(user => {
                req.flash("success", "Account created successfully!")
                req.session.user = user;
                res.redirect("/users/profile/" + user._id);
              })
              .catch(err => {
                req.flash("error", "Failed to create a user account!");
                console.log(err)
              });
          }
        }).catch(err => {
          req.flash("error", `Failed to create a new user account because: ${err.message}.`)
          res.redirect("/");
        }

        )
      } else {
        req.session.user = user;
        res.redirect("/users/profile/" + user._id);
      }
    }).catch(err => console.log(err));
  } else {
    res.redirect("/");
  }
},

  exports.index = (req, res, next) => {
    let username = req.session.user.username;
    User.findOne({ username: username }).then(user => {
      Media.find({ _id: { $in: user.latestMedia } }).then(medias => {
        res.locals.media = medias;
        res.locals.user = user;
        console.log("User in index method:", user);
        next()
      }).catch(err => console.log(err));
    })
  },

  exports.indexView = async (req, res) => {
    if (res.locals.media && res.locals.user) {
      res.render("profile", {
        user: res.locals.user,
        posts: res.locals.media
      })
    } else {
      res.redirect('/')
    }
  }

// *** HELPER FUNCTIONS *** //

/**
 * Instagram Business Account data: connected instagram User ID.
 * @param {*} pageId The id of Instagram user - Business or Creator Account that is
 * connected to Facebook page.
 * @param {*} token The access token granted after successful authorization.
 * @returns connected Instagram User ID.
 */
async function getInstagramUserId(pageId, token) {
  let instaBusinessAccountReq = {
    method: 'get',
    url: "https://graph.facebook.com/v10.0/" + pageId
      + "?fields=instagram_business_account&access_token=" + token
  }
  return await axios(instaBusinessAccountReq)
}

/**
 * Collection of FB - page id in response that is connected to instagram account.
 * @param {*} token The access token granted after successful authorization.
 * @returns The collection of Facebook pages.
 */
async function getPageId(token) {
  let facebookPagesReq = {
    method: 'get',
    url: "https://graph.facebook.com/v10.0/me/accounts?access_token=" + token
  }
  return await axios(facebookPagesReq);
}

/**
 * 
 * @param {*} userId The instagram id of authorized user.
 * @param {*} token The access token of authorized user.
 * @returns profile data like website url, biography, username, followers and follows count.
 */
async function getAllProfileData(userId, token) {
  let personalBusinessDataReq = {
    method: 'get',
    url: 'https://graph.facebook.com/v3.2/' + userId + '?fields=biography%2Cid%2Cusername%2Cname%2Cwebsite%2Cfollowers_count%2Cfollows_count&access_token=' + token
  }
  return await axios(personalBusinessDataReq);
}

/**
 *  
 * @param {*} userId The instagram id of authorized user.
 * @param {*} token The access token of a authorized user.
 * @returns The id of latest 20 media published the user.
 */
async function getAllMediaId(userId, token) {
  let mediaDataReq = {
    method: 'get',
    url: 'https://graph.facebook.com/' + userId + '/media?limit=20',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  }
  return await axios(mediaDataReq);
}

/**
 * Gets the detailed info about all recent media.
 * @param array The array of media's id.
 * @param token The access token of a authorized user.
 * @returns the detailed info about the published media e.g. caption, likes count, media type and ownership.
 */
async function getAllMediaData(array, token) {
  let mediaDetailedInfo = [];
  for (const media of array) {
    if (media.id) {
      let mediaInfoReq = {
        method: 'get',
        url: 'https://graph.facebook.com/v10.0/' + media.id + '?fields=owner,caption,like_count,comments_count&access_token=' + token,
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }
      let mediaInfoResponse = await axios(mediaInfoReq);
      mediaDetailedInfo.push(mediaInfoResponse.data);
    }
  };
  return mediaDetailedInfo;
}