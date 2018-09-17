const express = require('express');
const router = express.Router();
const passport = require('passport');
const Entry = require('../models/entry');
const User = require('../models/user');
// GET Home Page
router.get('/', (req, res) => {
  res.render('index', {text: "Yo yo peeps!", title:""});
});

router.get('/home', isLoggedIn, (req, res) => {
  User.findById({'_id': req.user.id}, function(err, user){
    Entry.find({'authorId': user.id}, function(err, entries){
      if (err) {
        res.send(err);
      }
      res.render('home', {entry: entries, text: "Yo yo peeps!",title: 'Trifecta eJournal', documents: {}, profile: {}});
    })
  });
});

router.get('/single', isLoggedIn, (req, res) => {
  res.render('single', {title: 'Trifecta eJournal', text: '', documents: {}, profile: {}});
});


// GET REGISTER FORM
router.get('/register', (req, res) => {
  res.render('register');
});

// SIGN UP
router.post('/register', (req, res) => {
  User.register(new User({
    username: req.body.username,
    balance: 0
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


router.get('/login', (req, res) => {
  res.render('login');
});

// SIGN UP
router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login'
}), (req, res) => {

});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('login');
}


module.exports = router;
