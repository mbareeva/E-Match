const express = require('express');
const router = express.Router();
const instaGraphApiController = require('../controllers/instaGraphApiController');
const instaBasicApiController = require('../controllers/instaBasicApiController');

//// INSGTAGRAM BASIC API /////
router.get('/auth/instagram', instaBasicApiController.getAuthorisationCode);
router.get('/response', instaBasicApiController.getUserData)

//// Facebook GRAPH API////
router.get('/', instaGraphApiController.getStart);
router.get('/login', instaGraphApiController.login); //new
router.post('/users/create', instaGraphApiController.create);
router.get('/login/facebook', instaGraphApiController.loginViaFacebook);

router.get('/handleauth', instaGraphApiController.getAccess);
router.get('/auth/facebook', instaGraphApiController.getAuthorisationViaFacebook);
router.get('/users/profile', instaGraphApiController.index, instaGraphApiController.indexView);
module.exports = router;