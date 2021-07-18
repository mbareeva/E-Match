const express = require('express');
const User = require("../models/user");
const Instagram = require("node-instagram").default;
const axios = require('axios');
const qs = require('qs');
const { Client } = require('elasticsearch');
const bonsai = process.env.BONSAI_URL || "http://localhost:9200";
const client = new Client({ host: bonsai });

const INSTA_URL_ACCESS_TOKEN = 'https://api.instagram.com/oauth/access_token';
const INSTA_URL_GRAPH = 'https://graph.instagram.com/me';
const redirectUri = 'https://e-match-htw.herokuapp.com/handleauth';

const {clientId, clientSecret} = require('../keys').instagram;

// node instagram package for authorization
const instagram = new Instagram({
  clientId: clientId,
  clientSecret: clientSecret
})

exports.getStart = (req, res) => {
  res.render('index');
}

exports.login = (req, res) => {
  res.redirect("/auth/instagram");
}

/**
 * Authorize a user with a help of authorization window from Instagram.
 * If the authorization is successful, the code is generated.
 */
exports.getAuthorisationCode = (req, res) => {
  res.redirect(
    instagram.getAuthorizationUrl(redirectUri, {
      scope: ['user_profile', 'user_media']
    })
  );
}

/**
 * Exchanges the generated code for a token 
 * that will allow the access to user's data e.g.
 * user id, username and media data.
 */
exports.getAccess = async (req, res) => {
  let code = req.query;
  req.session.code = code;
  var data = qs.stringify({
    'client_id': clientId,
    'grant_type': 'authorization_code',
    'code': req.session.code.code,
    'client_secret': clientSecret,
    'redirect_uri': redirectUri
  });
  var config = {
    method: 'post',
    url: INSTA_URL_ACCESS_TOKEN,
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
}

/**
 * Renders the page of successully authentificated user via instagram.
 */
exports.getUserData = async (req, res) => {
  let userid_test = req.session.user_id;
  let accesstoken_test = req.session.access_token;
  console.log("Saved user id: ", userid_test);
  console.log("Saved access token: ", accesstoken_test);
  let media = {
    method: 'get',
    url: INSTA_URL_GRAPH + '/media?fields=id,caption,media_url,timestamp&access_token=' + accesstoken_test,
    headers: {
      'Authorization': 'Bearer' + accesstoken_test
    }
  };

  let profile = {
    method: 'get',
    url: INSTA_URL_GRAPH + '?fields=id,username,account_type,media_count&access_token=' + accesstoken_test,
    headers: {
      'Authorization': 'Bearer' + accesstoken_test
    }
  };
  const profileData = await axios(profile);
  const mediaData = await axios(media);
  res.render('profile', {
    user: profileData.data,
    posts: mediaData.data
  })
}