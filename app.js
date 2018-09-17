var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser            = require('body-parser');
var LocalStrategy         = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
var User = require('./models/user');
var app = express();

mongoose.connect('mongodb://localhost:27017/Auth-Demo',(err, db) => {
// mongoose.connect(dbURI, {
  useMongoClient: true
}, (err, db) => {
  if (err) {
    console.log(err);
  }
  console.log('Now connected to DB');
  db = db;
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')({
  secret: "fuzzywuzzyorwashe",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ROUTES
// ============================
var mainRoutes = require('./routes/index');
var entryRoutes = require('./routes/entry');
app.use('/', mainRoutes);
app.use('/entry', entryRoutes);

app.listen(5000,() =>{
  console.log('Now running...');
});
