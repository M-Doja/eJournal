const express = require('express');
const router = express.Router();
const passport = require('passport');
const Entry = require('../models/entry');
const User = require('../models/user');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('Z1%UrQ7_d6F@3E!db2eg');
const dates = [];
const moment = require('moment');


/* Render Home Page */
router.get('/', (req, res) => {
  res.render('index', {text: "Yo yo peeps!", title:""});
});

var now = moment.now('HH:mm:ss');
console.log("Index right now: ", now);

router.get('/addpost', function(req, res, next) {
  res.send('hi there')
});

/* GET Home Page */
router.get('/home', isLoggedIn, (req, res) => {
  User.findById({'_id': req.user.id}, function(err, user){
    Entry.find({'authorId': user.id}, function(err, entries){
      if (err) {
        res.send(err);
      }
      var sum;
      for (var i = 0; i < entries.length; i++) {
        entries[i].subject = cryptr.decrypt(entries[i].subject);
        entries[i].body = cryptr.decrypt(entries[i].body);
      }
      // var days = (1538263852558 / 86400000) * 365;
      console.log("hello world");
console.log();
      res.render('home', {user: req.user, entry: entries, text: "",title: 'Trifecta Community eJournal', docs: '', profile: ''});
    })
  });
});

router.get('/:id/profile', isLoggedIn, (req, res) => {
  User.findById({'_id': req.user.id}, function(err, user) {
    Entry.find({'authorId': user.id}, function(err, entries){
      if (err) {
        res.send(err);
      }
      var sum;
      for (var i = 0; i < entries.length; i++) {
        entries[i].subject = cryptr.decrypt(entries[i].subject);
        entries[i].body = cryptr.decrypt(entries[i].body);
      }
      // var days = (1538263852558 / 86400000) * 365;
      console.log("hello world");
console.log();
      res.render('profile', { user : req.user, entry: entries, text: "",title: 'Trifecta eJournal', docs: '', profile: ''});
    })
  });
});
router.get('/:id/entries', isLoggedIn, (req, res) => {
  User.findById({'_id': req.user.id}, function(err, user){
    Entry.find({'authorId': user.id}, function(err, entries){
      if (err) {
        res.send(err);
      }
      var sum;
      for (var i = 0; i < entries.length; i++) {
        entries[i].subject = cryptr.decrypt(entries[i].subject);
        entries[i].body = cryptr.decrypt(entries[i].body);
      }
      // var days = (1538263852558 / 86400000) * 365;
      console.log("hello world");
console.log();
      res.render('entry', { user : req.user, entry: entries, text: "",title: 'Trifecta eJournal', docs: '', profile: ''});
    })
  });
})

/* Render Register Form */
router.get('/register', (req, res) => {
  res.render('register');
});

/* POST Register New User */
router.post('/register', (req, res) => {
  User.register(new User({
    username: req.body.username,
    balance: 30
  }),req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.render('register')
    }
    passport.authenticate('local')(req, res, function(){
      res.redirect('/home')
    });
  });
});

/* Render Login Page */
router.get('/login', (req, res) => {
  res.render('login');
});

/* POST Sign In */
router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login'
}), (req, res) => {

});

/* GET Log Out Page*/
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/no_credit', (req, res, next) => {
  res.render('nocredit', {title: ''})
});

function  daysChecker(oldDate, newDate){
  let diff = newDate - oldDate;
  if ( diff === 1) {
    console.log('Next Day');
  }else {
    console.log(diff + " days passed");
  }
}

// daysChecker('9/27/2018', '9/28/2018');

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('login');
}


module.exports = router;
