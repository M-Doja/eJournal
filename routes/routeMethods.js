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
      res.render('profile', { unread:numUnRead, isFollowing: iFollowYou,  currentUser : req.user, user : user, entry:req.user.entries, text: "Welcome back to your page",title: 'Link Connect', msg: [], docs: '', profile: ''});
    });
  },
  GetFollowers: function(req, res){

    User.findById({'_id': req.user.id}, function(err, user){
      // user.following.forEach(function(userID){
      //   User.findById({'_id': userID}, function(err, followedUser){
      //     res.send(followedUser);
      //   })
      for (var i = 0; i < user.following.length; i++) {
        var folowUser = {
          userID: user.following[i].id
        }
        usersArr.push(folowUser);
        // return usersArr;
      }

      // })
    })
  }
}
