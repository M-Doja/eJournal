const express = require('express');
const router = express.Router();
const passport = require('passport');
const Entry = require('../models/entry');
const User = require('../models/user');
var fsm = require('./fsMethods');
var os = require('os');
var destination = os.homedir()+'/Documents/eJouranl';
var profileLoc = destination+'/profile-json';
var dataLoc = destination+'/eJournal.db';



// GET Home Page
router.get('/', (req, res) => {
  res.render('index', {text: "Yo yo peeps!", title:""});
});

router.get('/home', isLoggedIn, (req, res) => {
  // var userDATA = fsm.directoryCheck();
  User.findById({'_id': req.user.id}, function(err, user){
    Entry.find({'authorId': user.id}, function(err, entries){
      if (err) {
        res.send(err);
      }
      console.log(fsm.fetchData(dataLoc));
      res.render('home', {entry: entries, text: "Yo yo peeps!",title: 'Trifecta eJournal', docs: fsm.fetchData(dataLoc), profile: fsm.fetchData(profileLoc)});
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
