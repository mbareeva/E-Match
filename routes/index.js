const express = require('express');
const router = express.Router();
const User = require("../models/user");
const fetch = require("node-fetch");
const Insta = require('scraper-instagram');
const Instagram = require("node-instagram").default;
var qs = require('qs');
const {clientId, clientSecret, testUsers} = require('../keys').instagram;
const { default: axios } = require('axios');
const instagram = new Instagram({
  clientId: clientId,
  clientSecret: clientSecret,
  //accessToken: accessToken
})

const instaURL = "https://api.instagram.com/";
const redirectUri = 'https://e-match-htw.herokuapp.com/handleauth';

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/privacy-policy', (req, res) => {
  res.render('privacy');
});

router.get('/auth/instagram', (req, res) => {
  res.redirect(
    instagram.getAuthorizationUrl(redirectUri, {
      scope: ['user_profile', 'user_media']
    })
  );
});

// router.get('/auth/instagram', async (req, res) => {
//   let auth_code = {
//     method: 'get',
//     url: 'https://api.instagram.com/oauth/authorize?client_id=' + clientId +
//       '&redirect_uri=' + redirectUri +
//       '&scope=user_profile,user_media&response_type=code',
//   };

//   let responseCode = await axios(auth_code);
// })

router.get('/response', async (req, res) => {
  let axios = require('axios');

  let media = {
    method: 'get',
    url: 'https://graph.instagram.com/me/media?fields=id,caption,media_url,timestamp&access_token=' + testUsers[0].accessToken,
    headers: {
      'Authorization': 'Bearer' + testUsers[0].accessToken
    }
  };

  let profile = {
    method: 'get',
    url: 'https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=' + testUsers[0].accessToken,
    headers: {
      'Authorization': 'Bearer' + testUsers[0].accessToken
    }
  };

  const profileData = await axios(profile);
  const mediaData = await axios(media);
  res.render('profile', {
    user: profileData.data,
    posts: mediaData.data
  })
})

router.get('/handleauth', async (req, res) => {
  let code = req.query;
  req.session.code = code;
  console.log("Should be code: ", req.session.code);
  let axios = require('axios');
  var data = qs.stringify({
    'client_id': clientId,
    'grant_type': 'authorization_code',
    'code': req.session.code.code,
    'client_secret': clientSecret,
    'redirect_uri': redirectUri
  });
  var config = {
    method: 'post',
    url: 'https://api.instagram.com/oauth/access_token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: data
  };
  let user_data = await axios(config);
  req.session.access_token = user_data.data.access_token;
  req.session.user_id = user_data.data.user_id;
  console.log("Should be user id: ", req.session.user_id);
  console.log("Should be session access token: ", req.session.access_token);
  res.redirect("/response");
})

// router.get('/access', async (req, res) => {
//   console.log("Req locals: ", req.code);
//   let code = req.code;
//   console.log("Code: ", code);
//   let axios = require('axios');
//   var data = qs.stringify({
//     'client_id': clientId,
//     'grant_type': 'authorization_code',
//     'code': code,
//     'client_secret': clientSecret,
//     'redirect_uri': redirectUri
//   });
//   var config = {
//     method: 'post',
//     url: 'https://api.instagram.com/oauth/access_token',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     data: data
//   };
//   let user_data = await axios(config);
//   req.session.access_token = user_data.access_token;
//   req.session.user_id = user_data.user.id;
//   console.log("Should be access token: ", user_data);
//   res.redirect("/user");
// })
router.get('/login', (req, res) => {
    res.redirect("/auth/instagram");
  });

module.exports = router;