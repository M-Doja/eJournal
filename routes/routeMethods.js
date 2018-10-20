const Entry = require('../models/Entry');
const Message = require('../models/Message');
const User = require('../models/User');
var usersArr = [];
var followingArr = [];

module.exports = {
  GetProfile: function(req, res, reqParams){
    User.findOne({'username': reqParams}, function(err, user) {
      if (err) {
        console.log(err);
      }
      var numUnRead = req.user.inbox.length - req.user.seen.length;
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
      User.find({}, function(err, allUsers){
        Entry.find({}, function(err, allEntries){

          res.render('profile', {entries:allEntries, unread:numUnRead, isFollowing: iFollowYou,  currentUser : req.user, user : user, allUsers: allUsers, entry:req.user.entries, text: "Welcome back to your page",title: 'Link Connect', msg: [], docs: '', profile: ''});
        })

      })
    });
  },
  GetComMember: function(req, res, reqSearch){
    User.find({'username': reqSearch.toLowerCase()}, function(err, user){
      if (err) {
        return res.redirect('/community/all');
      }
      const member = user;
      if (member) {
        var numUnRead = req.user.inbox.length - req.user.seen.length;
        return res.render('community', {unread:numUnRead, title: 'Link Connect', users: member, user : req.user})
      }
    })
  },
  GetWholeCommunity: function(req, res){
    User.find({}, function(err, users){
      if (err) {
        console.log(err);
      }else {
        var numUnRead = req.user.inbox.length - req.user.seen.length;
        res.render('community', {unread:numUnRead, title: 'Link Connect', users: users, user : req.user})
      }
    });
  },
  AddUserToFollow: function(req, res, next, newFollowId, currentUserId){
    User.findById({'_id': newFollowId}, function(err, userFollowed){
      User.findById({'_id': currentUserId}, function(err, follower){
        if (err) {
          console.log(err);
        }
        let alreadyFollowing;
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

      let alreadyAFollower;
      url = userFollowed.username;
      userFollowed.followers.forEach((followingUser) => {
        if (req.user.id === followingUser.id) {
          alreadyAFollower = true;
          return alreadyAFollower
        }
      });

      if (!alreadyAFollower) {
        userFollowed.followers.push({
          id: req.user.id,
          name: req.user.username,
          pic: req.user.avatar
        });
      }

      userFollowed.save(function(err){
        if (err) {
          console.log(err);
        }
      });

     res.render('profile', { isFollowing: 'iFollowYou', currentUser : req.user, user : userFollowed, entry:[], text: "Welcome back to your page",title: 'Link Connect', msg: [], docs: '', profile: ''});
   });
 },
 RemoveFollowedUser: function(req, res, next, currentUser, reqParams, currentUserId){
   User.updateOne(currentUser, {$pull: {following: {id :reqParams }}}, function(err) {
     if (err) {
       res.send(err);
     }
     User.findById({'_id': reqParams}, function(err, user) {
       if (err) {
         res.send(err);
       }
       User.updateOne(user, {$pull: {followers: {id : currentUserId }}}, function(err) {
         if (err) {
           res.send(err);
         }
       });
       res.redirect(`/${user.username}`)
     });
   });
 }
}
