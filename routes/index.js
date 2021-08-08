const express = require('express');
const router = express.Router();
const instaGraphApiController = require('../controllers/instaGraphApiController');
const instaBasicApiController = require('../controllers/instaBasicApiController');
const matchesController = require('../controllers/matchesController');
const userController = require('../controllers/userController');
cobst userController = require('../controllers/userController')

//// INSGTAGRAM BASIC API /////
router.get('/auth/instagram', instaBasicApiController.getAuthorisationCode);
router.get('/response', instaBasicApiController.getUserData)

//// Facebook GRAPH API////
router.get('/', instaGraphApiController.getStart);
router.get('/login', instaGraphApiController.login); //new
router.post('/users/create', instaGraphApiController.create);
router.get('/login/facebook', instaGraphApiController.loginViaFacebook);
router.get('/users/logout', userController.logout);

router.get('/handleauth', instaGraphApiController.getAccess);
router.get('/auth/facebook', instaGraphApiController.getAuthorisationViaFacebook);
router.get('/users/profile/:id', instaGraphApiController.index, instaGraphApiController.indexView);

router.get('/users/matches/', matchesController.renderAllMatches); //tryout
// router.get('/users/matches/', matchesController.getMatches, matchesController.renderAllMatches);
// router.get('/users/matches/:userId', matchesController.getMatch, matchesController.renderSingleMatch);
module.exports = router;