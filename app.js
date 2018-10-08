const config = require('./lib');
const express = require('express');
const path = require('path');
const stripe = require('stripe')(config.Stripe_Test_Key);
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const middleware = require('./middleware');
const validator = require('express-validator');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const User = require('./models/User');
const app = express();

mongoose.connect(config.DB_Dev_URI,(err, db) => {
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
app.use(validator());
app.use(require('express-session')({
  secret: config.Session_Secret,
  resave: false,
  saveUninitialized: false
}));

app.use(function(req, res, next) {
    if (req.session.user === null){
// if user is not logged-in redirect back to login page //
        res.redirect('/');
    }   else{
        next();
    }
});

app.use(express.static(path.join(__dirname + '/public')));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// ROUTES
// ============================
var mainRoutes = require('./routes/index');
var entryRoutes = require('./routes/entry');
var stripeRoutes = require('./routes/stripe');
var messageRoutes = require('./routes/message');

app.use('/', mainRoutes);
app.use('/entries', entryRoutes);
app.use('/stripe', stripeRoutes);
app.use('/inbox', messageRoutes);


app.listen(config.Port, () => {
  console.log('Now running...');
});
