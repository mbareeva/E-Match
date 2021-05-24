const express = require('express'),
morgan = require('morgan'),
session = require('cookie-session'),
expressSession = require('express-session'),
cookieParser = require('cookie-parser'),
path = require('path'),
layouts = require('express-ejs-layouts'),
mongoose = require("mongoose");
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

//middlewares
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

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  app.locals.user = req.user;
  console.log()
  next();
});

//routes
app.use(require('./routes/index'));

// app.get('/', (req, res) => {
//   res.send("Welcome");
// })

app.listen(app.get('port'), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`
  );
});
