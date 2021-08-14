const { Client } = require('elasticsearch');
const { UserScraper } = require('instagram-scraper-api/services/user.service');
const bonsai = process.env.BONSAI_URL || "http://localhost:9200";
const client = new Client({ host: bonsai });
const User = require("../models/user");
//The controller where the query is defined that generated the matches for business profile
//in Instagram.
module.exports = {

  logout: (req, res, next) => {
    req.logout();
    req.session.user = null;
    req.flash("success", "You have been logged out!")
    res.redirect('/')
  },

  authenticate: (req, res, next) => {
    User.findOne({
      username: req.body.username
    })
      .then(user => {
        if (user) {
          req.session.user = user;
          res.redirect("/users/profile/" + user._id);
          next();
        } else {
          res.redirect("/");
          next();
        }
      })
      .catch(error => {
        console.log(`Error logging in user: ${error.message}`);
      })
  }
}