const User = require("../models/user");
const Media = require("../models/media");
const { Client } = require('elasticsearch');
const bonsai = process.env.BONSAI_URL || "http://localhost:9200";
const client = new Client({ host: bonsai });
const graphApiController = require("./instaGraphApiController");
//The controller where the query is defined that generated the matches for business profile
//in Instagram.
module.exports = {

  /**
   * Get all recommendations for the logged in user.
   */
  renderAllMatches: (req, res) => {
    // if (res.locals.matches) {
    res.render("matches/index")
    //}
  },

  /**
   * Get a recommendation for the logged in user.
   */
  renderSingleMatch: (req, res) => {
    res.render("matches",
      {
        userId: req.params.userId
      });
  },

  /**
   * Generated the matches for the logged in user by sending a request to the Elasticsearch.
   * @param {Object} req 
   * @param {*} res 
   * @param {*} next Next function to be called.
   */
  getMatches: (req, res, next) => {
    let userId = req.params._id;
    User.findById(userId).then(thisUser => {
      res.locals.user = user;
      Media.find({ _id: { $in: thisUser.latestMedia } }).then(mediaItems => {
        res.locals.media = mediaItems; // here maybe extracted keywords from captions
        let keywords = [];
        let queryObject = {
          "specialisation": user.specialisation,
          "profileCategory": user.profileCategory,
          "keywords": this.getKeywords(thisUser)
        }
        let query = this.setQuery("users", queryObject);

        this.sendQueryRequest(req, res, next, user, query);
      }).catch(error => {
        console.error(`Error while indexing media items`, error);
      })
    })
  },

  getMatch: (req, res, next) => {
    let userId = req.params.userId;
    User.findOne({ _id: userId }).then(user => {
      res.locals.match = user;
      res.redirect(`/users/matches/${userId}`)
    })
  },

  setQuery: (index, queryObject) => {
    keywords.forEach(keyword => {

    })

    let engagementRate = this.getEngagementRate();
    let query = {
      index: index,
      body: {
        query: {
          function_score: {
            query: {
              match: {
                category: ""
              }
            }
          },
          functions: [
            {
              script_score: {
                script: {
                  source: (doc['likes'].value / doc['comments'] / doc['followers_count'].value * 100)
                }
              }
            }
          ],
          boost: 5,
          boost_mode: "sum"
        }
      }
    }
  },

  sendQueryRequest: () => {
    client.search(query, (err, res) => {
      if (err) return next(err);
      let data = res.hits.hits;
      let result = [];
      if (data) {
        let matchesFound = data.map(async hit => {
          let user = await User.findById(hit._id);
          result.push(user);
        })
        res.local.matches = matchesFound;
        next();
      } else {
        console.log("No matches found.")
      }
    }).then(response => {

    })

  },

  //////// HELPER FUNCTIONS ///////
  /**
   * 
   * @param {Object} user The user whose engagement rate is calculated.
   * @returns The engagement rate of the user based on the activity of its followers.
   */
  getEngagementRate: (user) => {
    //engagement rate = (likes + comments) / Followers x 100
    let totalLikes
    let totalCommentCount
    user.latesMedia.forEach(mediaItem => {
      totalLikes += mediaItem.likes
      totalCommentCount += mediaItem.commentCount
    })
    let average = (totalLikes + totalCommentCount) / user.followers_count * 100;
    return average;
  },


  getKeywords: (user) => {

  }


}