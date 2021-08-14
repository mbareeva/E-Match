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
app.use(bodyParser.urlencoded({ extended: false }));
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
