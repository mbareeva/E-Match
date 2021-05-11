// const express = require('express'),
// morgan = require('morgan'),
// session = require('cookie-session'),
// expressSession = require('express-session'),
// cookieParser = require('cookie-parser'),
// path = require('path'),
// engine = require('ejs'),
// mongoose = require("mongoose");
// mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/e-match", 
//   {
//     useNewUrlParser: true
//   }
// ),

// //init
// app = express();

// app.use(express.urlencoded({
//   extended: false
// }));

// //settings

// app.use(express.json());
// app.set("port", process.env.PORT || 3000);
// console.log(process.env.PORT);
// console.log(__dirname);
// app.set('views', path.join(__dirname, 'views'));
// //app.engine('ejs', engine);
// app.set('view engine', 'ejs');

// //middlewares
// app.use(morgan('dev'));
// app.use(cookieParser('mysecretword'))
// app.use(expressSession({
//   secret: 'mysecretword',
//   cookie: {
//     maxAge: 4000000
//   },
//   resave: false,
//   saveUninitialized: false
// }));

// app.use((req, res, next) => {
//   res.locals.session = req.session;
//   console.log()
//   next();
// });

// //routes
// app.use(require('./routes/index'));

// // app.get('/', (req, res) => {
// //   res.send("Welcome");
// // })

// app.listen(app.get('port'), () => {
//   console.log(`Server running at http://localhost:${app.get("port")}`
//   );
// });

const axios = require('axios');
const prompts = require('prompts');

(async () => {
  console.log('Starting Terminal scraper…')
  const response = await prompts({
  type: 'text',
  name: 'username',
  message: 'Which User you like to scrape??'
  });
  console.log('Starting to scrape')
  //The input from the terminal can be found with response.username
  //now we take that result and call getFollowers
  getFollowers(response.username)
  })();

  async function getFollowers(username) {
    try {
    const {
    data
    } = await axios.get(`https://www.instagram.com/${username}/?__a=1`)
    user = data.graphql.user
    let followers = user.edge_followed_by.count
    let following = user.edge_follow.count
    let fullname = user.full_name
    let user_name = user.username
    let profile_pic = user.profile_pic_url_hd
    console.log(`${user_name} has ${followers} and follows ${following}. His full name is ${fullname}. His pic is ${profile_pic}`)
    } catch (error) {
    console.log('USER NOT FOUND')
    // throw Error(error);
    }
    }