const express = require('express');
const router = express.Router();
const passport = require('passport');
const Entry = require('../models/Entry');
const Message = require('../models/Message');
const { body, validationResult } = require('express-validator/check');
const User = require('../models/User');
const moment = require('moment');
const Mid = require('../middleware');
const RM = require('./routeMethods');


/* Render Login / Registration Page */
router.get('/', (req, res) => {
  res.render('index', {text: "", title:"Link Connect", unread: '', user:req.user });
});

/* Render Login Form */
router.get('/login', (req, res) => {
  res.render('login');
});

/* Render Register Form */
router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/getFollowing', (req, res, next) => {
  RM.GetFollowers(req, res);
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

router.get('/community/all', (req, res, next) => {
  User.find({}, function(err, users){
    if (err) {
      console.log(err);
    }else {
      var numUnRead = req.user.inbox.length - req.user.seen.length;
      res.render('community', {unread:numUnRead, title: '', users: users,user : req.user,  entry:[], text: "Welcome back to your page",title: 'Link Connect', msg: [], docs: '', profile: ''})
    }
  })
});
// Add User to Follow
router.post('/add/follow/:id', Mid.isLoggedIn, (req, res, next) => {
  const newFollowId = req.params.id;
  User.findById({'_id': req.params.id}, function(err, userFollowed){
    console.log('just followed', userFollowed);
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
          id: newFollowId,
          name: userFollowed.username,
          pic: userFollowed.avatar
        });
      }
      follower.save(function(err){
        if (err) {
          console.log(err);
        }
      });
    });

  })
  // var url;
  // User.findById({'_id': req.user.id}, function(err, follower){
  //   if (err) {
  //     console.log(err);
  //   }
  //   var alreadyFollowing;
  //
  //   follower.following.forEach((followedUser) => {
  //     if (newFollowId === followedUser.id) {
  //       alreadyFollowing = true;
  //       return alreadyFollowing
  //     }
  //   });
  //   if (!alreadyFollowing) {
  //     follower.following.push({
  //       id: newFollowId
  //     });
  //   }
  //   follower.save(function(err){
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
  // });
  User.findById({'_id': newFollowId}, function(err, followed){
    var alreadyAFollower;
    url = followed.username;
    followed.followers.forEach((followingUser) => {
      if (req.user.id === followingUser.id) {
        alreadyAFollower = true;
        return alreadyAFollower
      }
    });
    if (!alreadyAFollower) {
      followed.followers.push({
        id: req.user.id,
        name: req.user.username,
        pic: req.user.avatar
      });
    }
    followed.save(function(err){
      if (err) {
        console.log(err);
      }
    });
   res.render('profile', { isFollowing: 'iFollowYou', currentUser : req.user, user : followed, entry:[], text: "Welcome back to your page",title: 'Link Connect', msg: [], docs: '', profile: ''})
  });

});

// Remove Followed User
router.post('/remove/follower/:id', Mid.isLoggedIn, (req, res, next) => {
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
    });
    res.redirect(`/${user.username}`)

  })
});

module.exports = router;
