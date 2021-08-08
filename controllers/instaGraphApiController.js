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
    website: body.website,
    profileCategory: body.profileCategory,
    specialisation: body.interest,
    location: body.location,
    username: body.username,
    role: body.role
  }
};

exports.getStart = (req, res) => {
  res.render('index', {
    userFB: res.locals.userFB
  });
}

exports.login = (req, res) => {
  res.redirect("/auth/facebook");
}

/**
 * Authorize a user with a help of authorization window from Instagram.
 * If the authorization is successful, the code is generated.
 */
exports.getAuthorisationViaFacebook = (req, res) => {
  res.send(`
    <html>
      <body>
        <a class="btn btn-primary btn-block" href="https://www.facebook.com/v6.0/dialog/oauth?client_id=${appId}&r
edirect_uri=${redirectUri}&response_type=code&scope=instagram_basic,pages_show_list">
          Log In With Facebook
        </a>
      </body>
    </html>
  `)
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
    req.session.user = personalBusinessData.data;
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
  req.body.fullname = userData.name,
    req.body.biography = userData.biography,
    req.body.followers_count = userData.followers_count,
    req.body.website = userData.website,
    req.body.username = userData.username;

  let user = getUserParams(req.body);
  if (user) {
    User.findOne({ _id: user.username }).then(data => {
      if (!data) {
        User.create(user).then((user) => {
          console.log("********** user **********: ", user);
          res.redirect("/users/profile/" + user._id);
        })
      } else {
        console.log("********** user **********: ", data);
        res.redirect("/users/profile/" + data._id);
      }
    })
  }

}


exports.index = (req, res, next) => {
  let userId = req.params.id;
  let mediaArrForUser = [];

  req.session.media.forEach(e => {
    let mediaContent = new Media({
      caption: e.caption,
      likes: e.likes
    });
    mediaContent.save();
    mediaArrForUser.push(mediaContent);
    console.log("RESULT: ", mediaContent);
  });

  console.log("User ID: ", userId);
  User.findOneAndUpdate({ _id: userId }, { $addToSet: { latestMedia: mediaArrForUser } }, { new: true })
    .then(user => {
      res.locals.user = user;
      next()
    })
    .catch(err => console.log(err));
}

exports.indexView = (req, res) => {
  console.log("IndexView: ", req.body);
  res.render("profile", {
    user: req.session.user,
    posts: req.session.media
  })
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
        url: 'https://graph.facebook.com/v10.0/' + media.id + '?fields=owner,caption,like_count&access_token=' + token,
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