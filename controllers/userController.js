const { Client } = require('elasticsearch');
const bonsai = process.env.BONSAI_URL || "http://localhost:9200";
const client = new Client({ host: bonsai });
//The controller where the query is defined that generated the matches for business profile
//in Instagram.
module.exports = {

  logout: (req, res, next) => {
    req.flash("success", "You have been logged out!");
    res.redirect('/')
  }
}