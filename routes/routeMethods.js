const Entry = require('../models/Entry');
const Message = require('../models/Message');
const User = require('../models/User');

module.exports = {
  GetProfile: function(req, res, reqParams){
    User.findOne({'username': reqParams}, function(err, user) {
      if (err) {
        console.log(err);
      }
      var numUnRead = user.inbox.length - user.seen.length;
      var iFollowYou;
      req.user.following.forEach((followedUser) => {
        if (followedUser.id) {
          if (followedUser.id === user.id) {
            iFollowYou = true;
            return iFollowYou;
          }
        }
      });
      var currentID = req.user.id;
      if (req.user.id !== user.id) {
        numUnRead = 0
      }
      res.render('profile', { unread:numUnRead, isFollowing: iFollowYou,  currentUser : req.user, user : user, entry:[], text: "Welcome back to your page",title: 'Link Connect', msg: [], docs: '', profile: ''});
    });
  },
  AddFollow: function(req, res, next, url, newFollowId){
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
      url = followed.username;
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
      });
     res.render('profile', { isFollowing: 'iFollowYou', currentUser : req.user, user : followed, entry:[], text: "Welcome back to your page",title: 'Link Connect', msg: [], docs: '', profile: ''})
    });
  }
}
