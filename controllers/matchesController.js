const User = require("../models/user");
const { Client } = require('elasticsearch');
const bonsai = process.env.BONSAI_URL || "http://localhost:9200";
const client = new Client({ host: bonsai });
const graphApiController = require("./instaGraphApiController");
//The controller where the query is defined that generated the matches for business profile
//in Instagram.
module.exports = {
  /**
   * 
   */
    getAllMatches: (req, res) => {
      res.render("matches");
    },
  
    getSingleMatche: (req, res) => {
      res.render("matches");
    },

    
}