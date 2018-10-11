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
      var numUnRead = req.user.inbox.length - req.user.seen.length;
      console.log("Unread: ", numUnRead);
      res.render('home', {
        unread: numUnRead,
        user: req.user,
        Users: allUsers,
        entry: entries,
        text: "",
        title: 'Trifecta Community eJournal',
        docs: '',
        profile: ''
      });
    });
  });
});

/* GET User Profile Page */
router.get('/:username', isLoggedIn, (req, res) => {
  User.findOne({'username': req.params.username}, function(err, user) {
    if (err) {
      console.log(err);
    }
    var iFollowYou;
    req.user.following.forEach((followedUser) => {
      if (followedUser.id === user.id) {
        iFollowYou = true;
        return iFollowYou;
      }
    });
    res.render('profile', { isFollowing: iFollowYou, currentUser : req.user, user : user, entry:[], text: "Welcome back to your page",title: 'Trifecta eJournal', msg: [], docs: '', profile: ''});
  });
});

// Add User to Follow
router.post('/add/follow/:id', isLoggedIn, (req, res, next) => {
  const newFollowId = req.params.id;
  User.findById({'_id': req.user.id}, function(err, follower){
    if (err) {
      console.log(err);
    }
    var alreadyFollowing;
    follower.following.forEach((followedUser) => {
      if (newFollowId === followedUser.id) {
        alreadyFollowing = true;
        return alreadyFollowing
      }
    });
    if (!alreadyFollowing) {
      follower.following.push({
        id: newFollowId
      });
    }
    follower.save(function(err){
      if (err) {
        console.log(err);
      }
    });
  });
  User.findById({'_id': newFollowId}, function(err, followed){
    var alreadyAFollower;
    followed.followers.forEach((followingUser) => {
      if (req.user.id === followingUser.id) {
        alreadyAFollower = true;
        return alreadyAFollower
      }
    });
    if (!alreadyAFollower) {
      followed.followers.push({
        id: req.user.id
      });
    }
    followed.save(function(err){
      if (err) {
        console.log(err);
      }
      res.redirect('/home');
    });
  })
});

// Remove Followed User
router.post('/remove/follower/:id', isLoggedIn, (req, res, next) => {
  User.updateOne(req.user, {$pull: {following: {id :req.params.id }}}, function(err) {
    if (err) {
      res.send(err);
    }
  });
  User.findById({'_id': req.params.id}, function(err, user) {
    if (err) {
      res.send(err);
    }
    User.updateOne(user, {$pull: {followers: {id :req.user.id }}}, function(err) {
      if (err) {
        res.send(err);
      }
      res.redirect('/home');
    });
  })
});




function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('login');
}

module.exports = router;
