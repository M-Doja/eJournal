const express = require('express');
const router = express.Router();
const passport = require('passport');
const Entry = require('../models/Entry');
const Message = require('../models/Message');
const { body, validationResult } = require('express-validator/check');
const User = require('../models/User');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('Z1%UrQ7_d6F@3E!db2eg');
const moment = require('moment');


/* Render Login / Registration Page */
router.get('/', (req, res) => {
  res.render('index', {text: "", title:""});
});

/* Render Login Form */
router.get('/login', (req, res) => {
  res.render('login');
});

/* Render Register Form */
router.get('/register', (req, res) => {
  res.render('register');
});

/* Render Credit Purchase Page */
router.get('/no_credit', isLoggedIn, (req, res, next) => {
  res.render('nocredit', {title: ''})
});

/* GET Log Out Page*/
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

/* POST Sign In */
router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login'
}), (req, res) => {});

/* POST Register New User */
router.post('/register', [
    body('username')
      .isLength({ min: 1 })
      .withMessage('Please enter a name'),
    body('password')
      .isLength({ min: 1 })
      .withMessage('Please enter an password'),
  ], (req, res) => {
  User.register(new User({
    username: req.body.username,
    balance: 30
  }),req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.render('register');
    }
    passport.authenticate('local')(req, res, function(){
      res.redirect('/home');
    });
  });
});

/* GET Home Page */
router.get('/home', isLoggedIn, (req, res) => {
  User.find({}, function(err, allUsers){
    if (err) {
      console.log(err);
    }
    console.log("ALl Users: ", allUsers);
    Entry.find({}, function(err, entries) {
      if (err) {
        console.log(err);
      }
      console.log('THE ENTRIES: ', entries);
      res.render('home', {user: req.user, Users: allUsers, entry: entries, text: "",title: 'Trifecta Community eJournal', docs: '', profile: ''});
    })
  });
});

/* GET User Profile Page */
router.get('/:username', isLoggedIn, (req, res) => {
  var self;
  User.findOne({'username': req.params.username}, function(err, user) {
    if (user.id === req.user.id) {
      self = user; // On own profile page
    }

    res.render('profile', {currentUser : req.user, profileID: user.username, user : user, entry:[], text: "Welcome back to your page",title: 'Trifecta eJournal', msg: [], docs: '', profile: ''});

  });
});


function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('login');
}

module.exports = router;
