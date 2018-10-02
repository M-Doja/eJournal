const keyPublish = 'pk_test_mqsHIcQhk7MQsVdWM21RbvOp';
const keySecret = 'sk_test_MH29dqvmnJeafJIZPiJ1SmCt';
var express = require('express');
var path = require('path');
const stripe = require('stripe')(keySecret);
const router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var LocalStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
var User = require('./models/user');
var app = express();



mongoose.connect('mongodb://localhost:27017/Auth-Demo',(err, db) => {
// mongoose.connect(dbURI, {
  useMongoClient: true
  useNewUrlParser: true
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


app.post('/stripe/charge/thirty', (req, res) => {
  let token = req.body.stripeToken
  console.assert(token)
  const amount = 399
  stripe.charges.create({
    amount: amount,
    currency: 'usd',
    source: token,
    description: 'Post Purchase'
  }, (err, charge) => {
    if (err) {
      res.redirect('/stripe/payment-failure?err_msg=' + err.message)
    } else {
      console.log('Charged successful')
			console.log('charge', charge)
      res.redirect('/payment-success')
    }
  })
});

app.post('/stripe/charge/ninety', (req, res) => {
  let token = req.body.stripeToken
  console.assert(token)
  const amount = 999
  stripe.charges.create({
    amount: amount,
    currency: 'usd',
    source: token,
    description: 'Post Purchase'
  }, (err, charge) => {
    if (err) {
      res.redirect('/stripe/payment-failure?err_msg=' + err.message)
    } else {
      console.log('Charged successful')
			console.log('charge', charge)
      res.redirect('/payment-success')
    }
  })
});

app.get('/payment-success', (req, res, next) => {
  res.render('payment-success');
});


app.listen(5000,() =>{
  console.log('Now running...');
});
