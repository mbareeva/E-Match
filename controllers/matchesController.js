const User = require("../models/user");
const Media = require("../models/media");
const { Client } = require('elasticsearch');
const bonsai = process.env.BONSAI_URL || "http://localhost:9200";
const client = new Client({ host: bonsai });
//const graphApiController = require("./instaGraphApiController");
const { query } = require("express");
const user = require("../models/user");
//The controller where the query is defined that generated the matches for business profile
//in Instagram.
module.exports = {

  /**
   * Get all recommendations for the logged in user.
   */
  renderAllMatches: (req, res) => {
    res.render("matches/index", {
      users: res.locals.matches
    })
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
    let userId = req.params.id;
    console.log(userId)
    User.findOne({ _id: userId }).then(thisUser => {
      console.log(thisUser);
      res.locals.user = thisUser;
      Media.find({ _id: { $in: thisUser.latestMedia } }).then(mediaItems => {
        res.locals.media = mediaItems;
        //console.log("Check the media.locals: ", res.locals.media ? res.locals.media : "") // here maybe extracted keywords from captions

        //Object definition for query later on.
        let queryObject = {}
        //Keywords extraction according to NLTK Algorithm. Link to the library: ... !!!!.
        //let keywordsBiography = { keywords: this.getKeywords(thisUser) };
        //let keywordsCaptions = { keywords: this.getKeywords(mediaItems.caption) }
        //Push values to the object.
        console.log("Specialisation: ", thisUser.specialisation)
        queryObject.specialisation = thisUser.specialisation

        queryObject.interest = thisUser.interest
        queryObject.location = thisUser.location
        queryObject.keywordsBio = thisUser.biography
        // queryObject[keywordsMedia] = keywordsCaptions
        queryObject.captions = "";
        mediaItems.forEach(item => {
          queryObject.captions += item.caption + " "
        })

        //Set the query with the object with important values.
        let query = module.exports.setQuery("users", queryObject, thisUser);

        module.exports.sendQueryRequest(req, res, next, thisUser, query);
      }).catch(error => {
        console.error(`Error while searching for media items.`, error);
      })
    }).catch(error => {
      console.error(`Error while searching for the user.`, error);
    })
  },

  getMatch: (req, res, next) => {
    let userId = req.params.userId;
    User.findOne({ _id: userId }).then(user => {
      res.locals.match = user;
      res.redirect(`/users/matches/${userId}`)
    })
  },

  /**
   * 
   * @param {String} index The index for search query.
   * @param {Object} queryObject The values that user has in its profile.
   * @param {Object} user The logged in user for whom the matches should be generated.
   */
  setQuery: (index, queryObject, user) => {
    let query = {
      index: index,
      body: {
        query: {
          function_score: {
            query: {
              bool: {
                should: [
                  {
                    match: {
                      "specialisation": {
                        query: queryObject.specialisation,
                        boost: Math.pow(2, 2)
                      }
                    }
                  },
                  {
                    match: {
                      "interest": {
                        query: queryObject.interest,
                        boost: Math.pow(2, 2)
                      },
                    }
                  },
                  {
                    match: {
                      "location": {
                        query: queryObject.location
                      }
                    }
                  },
                  {
                    match: {
                      "latestMedia.caption": {
                        query: queryObject.captions,
                        analyzer: "my_analyzer"
                      }
                    }
                  },
                  {
                    match: {
                      "biography": {
                        query: queryObject.keywordsBio,
                        analyzer: "my_analyzer",
                        boost: Math.pow(2, 2)
                      }
                    }
                  }
                ]
              }
            }
          },
          // functions: [
          //   {
          //     script_score: {
          //       script: {
          //         source: (doc['likes'].value + doc['comments'] / doc['followers_count'].value * 100)
          //       }
          //     }
          //   }
          // ],
          // boost: engagementRate,
          // boost_mode: "sum"
        }
      }
    }
    return query;
  },

  /**
   * Sends the search API request to Elasticsearch index.
   * Searches for matches according to the given query and
   * saves the results. Redirects to the next middleware function.
   */
  sendQueryRequest: (req, res, next, thisUser, query) => {
    client.search(query, async (err, result) => {
      if (err) {
        console.log("Error while searching for the matches.")
        return next(err);
      } else {
        let data = result.hits.hits;
        let maxScore = result.hits.max_score;
        console.log("Max Score: ", maxScore)
        console.log("Total matches count: ", data.length)
        let finalResult = [];
        if (data) {
          let matchesFound = data.map(async hit => {
            let user = await User.findById(hit._id);
            user.score = userScore(hit._score, maxScore);
            console.log("Score: ", user.score)
            user.engagementRate = await getEngagementRate(user);
            console.log("rate: ", user.engagementRate)
            if (user.username !== thisUser.username)
              finalResult.push(user);
          })
          await Promise.all(matchesFound)
          res.locals.matches = sortInfluentialUsers(finalResult);
          next();
        } else {
          console.log("No matches found.")
        }
      }
    })

  }
}

//////// HELPER FUNCTIONS ///////
/**
  * Sorts users according to the relevance score.
  * @param {Object} results The matched user generated by Elasticsearch.
  * @returns Sorted list of users.
  */
function sortInfluentialUsers(results) {
  results.sort((user1, user2) => {
    return user2.score - user1.score;
  })
  return results;
}

/**
 * Calculates the ration between the given score of a match and the max_score.
 * @param {*} usersScore The score of the match.
 * @param {*} maxScore The max score of the response.
 * @returns The score in percent.
 */
function userScore(userScore, maxScore) {
  return (userScore / maxScore * 100).toFixed(2);
}


/**
 * 
 * @param {Object} user The user whose engagement rate is calculated.
 * @returns The engagement rate of the user based on the activity of its followers.
 */
async function getEngagementRate(user) {
  //engagement rate = (likes + comments) / Followers x 100
  let totalLikes = 0
  let totalCommentCount = 0
  let points = await Media.find({ _id: { $in: user.latestMedia } }).then(items => {
    items.forEach(mediaItem => {
      totalLikes += mediaItem.likes
      totalCommentCount += mediaItem.commentCount
    })
    return totalLikes + totalCommentCount
  })
  let average = ((points) / user.followers_count) * 100;
  return average;
}