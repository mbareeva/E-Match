const express = require('express');
const router = express.Router();

const Instagram = require('node-instagram').default;
const {clientId, clientSecret} = require('../keys').instagram;
const instagram = new Instagram({
  clientId: clientId,
  clientSecret: clientSecret
})

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

  //req.session.access_token = data.access_token;
  //req.session.user_id = data.user.id;

  //instagram.config.accessToken = req.session.access_token;
  console.log(instagram);
  //res.redirect('/profile');

  // console.log(instagram);
  // console.log(data);
   res.json(data);
} catch(err) {
    res.json(err);
  }
});
router.get('/login', (req, res) => {
  res.redirect('/auth/instagram');
})
router.get('/logout', () => {})

router.get('/profile', async(req, res) => {
  try {
    const profileData = await instagram.get('/user/self');
    const media = await instagram.get('users/self/media/recent');
    res.render('profile', {user: profileData.data, posts: media.data});
  } catch(e) {
    console.log(e);
  }
  
})

module.exports = router;