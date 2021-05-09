const express = require('express');
const router = express.Router();
const User = require("../models/user");
const Instagram = require('node-instagram').default;
const fetch = require("node-fetch");
const {clientId, clientSecret, accessToken} = require('../keys').instagram;
const instagram = new Instagram({
  clientId: clientId,
  clientSecret: clientSecret,
  //accessToken: accessToken
})

const INSTA = "https://www.instagram.com/";
const redirectURi = 'https://e-match-htw.herokuapp.com/handleauth';

router.get('/', async (req, res) => {
  // let username = 'mayabareeva';
  // let data = await fetch(INSTA + username + "?__a=1");
  // res.json(data);
  res.render('index');
});

// router.get('/create', async (req, res) => {
//   let username = 'mayabareeva';
//   let data = await fetch(INSTA + username + "?__a=1");
//   console.log(data);
//   res.json(data);
// });


router.get('/auth/instagram', (req, res) => {
  res.redirect(
    instagram.getAuthorizationUrl(redirectURi, {
      scope: ["user_profile" , "user_media"]
    })
  )
});

router.get('/handleauth', async (req, res) => {
  try {
    const code = req.query.code;
    const data = await instagram.authorizeUser(code, redirectURi);
      req.session.user_id = data.user_id;
      req.session.access_token = data.access_token;
      console.log("user id: " + data.user_id);
      console.log("token: " + data.access_token);
      instagram.config.accessToken = req.session.access_token;
      console.log("Instagram: " + instagram.config);
      res.redirect('/profile');
  } catch (err) {
    res.json(err);
  }
});

// router.get('/login', (req, res) => {
//   res.redirect('/auth/instagram');
// })
// router.get('/logout', () => {})

router.get('/profile', async (req, res) => {
  try {
    //const profileData = await instagram.get('users/self');
    console.log("token: " + req.session.access_token);
    // const media = await instagram.get('users/' + req.session.user_id + '/media/recent', {access_token: instagram.accessToken});
    // const profileData = await instagram.get('users/'+ req.session.user_id, {access_token: instagram.accessToken});
    let username = 'mayabareeva';
    let data = await fetch(INSTA + username + "?__a=1");
    res.render('profile', { user: data.data});
  } catch (e) {
    console.log(e);
  }
})



module.exports = router;