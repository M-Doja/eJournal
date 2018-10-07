const express = require('express');
const router = express.Router();
const passport = require('passport');
const Entry = require('../models/entry');
const User = require('../models/user');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('Z1%UrQ7_d6F@3E!db2eg');
const moment = require('moment');


/* Render Login / Registration Page */
router.get('/', (req, res) => {
  res.render('index', {text: "Yo yo peeps!", title:""});
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
router.get('/no_credit', (req, res, next) => {
  res.render('nocredit', {title: ''})
});

router.get('/addpost', function(req, res, next) {
  res.send('hi there')
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



/* GET Home Page */
router.get('/home', isLoggedIn, (req, res) => {
  User.find({}, function(err, allUsers){
    if (err) {
      console.log(err);
    }
    for (var i = 0; i < allUsers.length; i++) {
      if (allUsers[i]._id === req.user.id) {
        console.log(allUsers[i]);
      }
    }
    Entry.find({'authorId': req.user.id}, function(err, entries) {
      if (err) {
        console.log(err);
      }
      res.render('home', {user: req.user, Users: allUsers, entry: entries, text: "",title: 'Trifecta Community eJournal', docs: '', profile: ''});
    })
  });
});

// router.get('/home', isLoggedIn, (req, res) => {
//   User.findById({'_id': req.user.id}, function(err, user){
//     Entry.find({'authorId': user.id}, function(err, entries){
//       if (err) {
//         res.send(err);
//       }
//       var sum;
//       for (var i = 0; i < entries.length; i++) {
//         entries[i].subject = cryptr.decrypt(entries[i].subject);
//         entries[i].body = cryptr.decrypt(entries[i].body);
//       }
//       // var days = (1538263852558 / 86400000) * 365;
//       console.log("hello world");
// console.log();
//       res.render('home', {user: req.user, entry: entries, text: "",title: 'Trifecta Community eJournal', docs: '', profile: ''});
//     })
//   });
// });

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






function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('login');
}

module.exports = router;
