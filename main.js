const express = require('express'),
  morgan = require('morgan'),
  session = require('cookie-session'),
  connectFlash = require('connect-flash'),
  expressSession = require('express-session'),
  cookieParser = require('cookie-parser'),
  path = require('path'),
  layouts = require('express-ejs-layouts'),
  mongoose = require("mongoose");
const passport = require('passport');
const router = require('./routes/index');
const User = require("./models/user");
const tf = require('@tensorflow/tfjs');
const data = require("./scraper/cleaned.json");
const vectors = require("./scraper/vectors.json");
const fs = require('fs');

// The ML model from TensorFlow.js for semantic text similarity. Dimension for vectors is 512.
// Link: https://github.com/jinglescode/demos/tree/master/src/app/components/nlp-sentence-encoder
// Retrieved on: 20.08.21 
const model = tf.sequential();
model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
const inputLayer = tf.tensor2d([1, 2, 3, 4], [4, 1]);
const outputLayer = tf.tensor2d([1, 3, 5, 7], [4, 1]);

model.fit(inputLayer, outputLayer, { epochs: 10 }).then(() => {
  model.predict(tf.tensor2d([5], [1, 1])).print();
});

const use = require('@tensorflow-models/universal-sentence-encoder');

const fillDocument = async () => {
  let model = await use.load()
  console.log("START")
  for (let user of data) {
    let sentences = "";
    sentences = user.biography + ","
    for (mediaitem of user.latestMedia) {
      if (mediaitem.caption) {
        sentences += mediaitem.caption + ","
      }
    }
    console.log("next element: ", data.indexOf(user))
    let embeddings = await model.embed([sentences])
    let arr = await embeddings.array();
    user.unit_vector = arr[0];
  };
  console.log("FINISHED")
  return;
}
if (vectors.length <= 0) {
  fillDocument().then(() => {
    console.log(data)
    fs.writeFile("./scraper/vectors.json", JSON.stringify(data, null, 4), 'utf8', function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
      console.log("JSON file with vector factors for users has been saved.");
    });
  })
}

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/e-match",
  {
    useNewUrlParser: true
  }
),

  //init
  app = express();

app.use(express.urlencoded({
  extended: false
}));

//settings

app.use(express.json());
app.set("port", process.env.PORT || 3000);
//app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(layouts);
//defines the folder for static files (css f.e.)
app.use(express.static(path.join(__dirname, 'public')));

// ***** middlewares - sessions and flash messages ***** //
app.use(morgan('dev'));
app.use(cookieParser('mysecretword'))
app.use(expressSession({
  secret: 'mysecretword',
  cookie: {
    maxAge: 4000000
  },
  resave: false,
  saveUninitialized: false
}));
app.use(connectFlash());

//  ***** Passport authentification ***** //
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  app.locals.user = req.user;
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  next();
});

// ***** routes ***** 
app.use(require('./routes/index'));

app.listen(app.get('port'), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`
  );
});
