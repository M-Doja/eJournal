const express = require('express');
const router = express.Router();
const moment = require('moment');
const passport = require('passport');
const Mid = require('../middleware');
const User = require('../models/User');
const Entry = require('../models/Entry');
const Message = require('../models/Message');
const { body, validationResult } = require('express-validator/check');
const RM = require('./routeMethods');

/* Render landing Page */
router.get('/', (req, res) => {
  res.render('index', {text: "", title:"Link Connect", unread: '', user:req.user });
});

/* Render Login Form */
router.get('/login', (req, res) => {
  res.render('login',{text: "", msg: '', title:"Link Connect", unread: '', user:req.user });
});

/* Render Register Form */
router.get('/register', (req, res) => {
  res.render('register',{text: "", msg: '', title:"Link Connect", unread: '', user:req.user });
});

/* Render Credit Purchase Page */
router.get('/no_credit', Mid.isLoggedIn, (req, res, next) => {
  res.render('nocredit', {title: 'Link Connect'})
});

/* GET Log Out Page*/
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

/* POST Sign In */
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user) {
    if (err) return next(err);

    if (! user) {
       res.render('login',{ success : false, msg : 'Invalid username or password!' });
    }
    req.login(user, function(err){
      if(err){
        return next(err);
      }
       res.redirect('/home');
    });
  })(req, res, next);
});

/* POST Register New User */
router.post('/register', (req, res) => {
  User.register(new User({
    username: req.body.username,
    balance: 30
  }),req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      return res.render('register',{msg: err.message});
    }
    passport.authenticate('local')(req, res, function(){
      res.redirect('/home');
    });
  });
});

/* GET Home Page */
router.get('/home', Mid.isLoggedIn, (req, res) => {
  User.find({}, function(err, allUsers){
    if (err) {
      console.log(err);
    }
    Entry.find({}, function(err, entries) {
      if (err) {
        console.log(err);
      }
      var numUnRead = req.user.inbox.length - req.user.seen.length;
      res.render('home', {
        unread: numUnRead,
        user: req.user,
        Users: allUsers,
        entry: entries,
        text: "",
        title: 'Link Connect',
        docs: '',
        profile: ''
      });
    });
  });
});

/* GET User Profile Page */
router.get('/:username', Mid.isLoggedIn, (req, res) => {
  var reqParams = req.params.username;
  RM.GetProfile(req, res, reqParams);
});

/* GET Community Member Filter Search */
router.post('/community/member', Mid.isLoggedIn,(req, res, next) => {
  RM.GetComMember(req, res, req.body.search);
})

/* GET Community Members Page */
router.get('/community/all', Mid.isLoggedIn, (req, res, next) => {
  RM.GetWholeCommunity(req, res);
});

/* GET User Profile Settings Page */
router.get('/:username/settings', Mid.isLoggedIn, (req, res, next) => {
  res.render('settings', {title:'Link Connect',user:req.user});
});

// Add User to Follow
router.post('/add/follow/:id', Mid.isLoggedIn, (req, res, next) => {
  const newFollowId = req.params.id;
  RM.AddUserToFollow(req, res, next, newFollowId, req.user.id);
});

// Remove Followed User
router.post('/remove/follower/:id', Mid.isLoggedIn, (req, res, next) => {
  RM.RemoveFollowedUser(req, res, next, req.user, req.params.id, req.user.id);
});

module.exports = router;
