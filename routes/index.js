const express = require('express');
const router = express.Router();

const Instagram = require('node-instagram').default;
const {clientId, clientSecret} = require('../keys').instagram;
const instagram = new Instagram({
  clientId: clientId,
  clientSecret: clientSecret,
  accessToken: accessToken
})
let user_id = null;

router.get('/', (req, res) => {
  res.render('index');
});

const redirectURi = 'https://e-match-htw.herokuapp.com/handleauth';

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
      console.log("user id: " + data.access_token);
      instagram.config.accessToken = req.session.access_token;
      console.log("Instagram: " + instagram.config);
      res.redirect('/profile');
  } catch (err) {
    res.json(err);
  }
});

router.get('/login', (req, res) => {
  res.redirect('/auth/instagram');
})
router.get('/logout', () => {})

router.get('/profile', async(req, res) => {
  try {
    //const profileData = await instagram.get('users/self');
    console.log("token: " + req.session.access_token);
    const media = await instagram.get('users/' + req.session.user_id + '/media/recent', {access_token: instagram.accessToken});
    const profileData = await instagram.get('users/'+ req.session.user_id, {access_token: instagram.accessToken});
    res.render('profile', {user: profileData.data, posts: media.data});
  } catch(e) {
    console.log(e);
  }
  
})

module.exports = router;