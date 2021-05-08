const express = require('express'),
morgan = require('morgan'),
session = require('cookie-session'),
path = require('path'),
engine = require('ejs'),
mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/e-match", 
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
console.log(__dirname);
app.set('views', path.join(__dirname, 'views'));
//app.engine('ejs', engine);
app.set('view engine', 'ejs');

//middlewares
app.use(morgan('dev'));

//routes
app.use(require('./routes/index'));

// app.get('/', (req, res) => {
//   res.send("Welcome");
// })

app.listen(app.get('port'), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`
  );
});