const express = require('express');
const router = express.Router();
const app = express();
const moment = require('moment');
const Entry = require('../models/Entry');
const User = require('../models/User');
const Message = require('../models/Message');
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const Cryptr = require('cryptr');
// const cryptr = new Cryptr('Z1%UrQ7_d6F@3E!db2eg');


// Show All Messgaes
router.get('/all', (req, res, next) => {
  Message.find({'toId': req.user.id}, function(err, allMessages) {
    if (err) {
      console.log(err);
    }
     allMessages.sort(function(a,b){
      return new Date(b.date) - new Date(a.date);
    });

    res.render('mail/allMail',{title: '', user:req.user,  inbox: allMessages})
  });
});

// POST New Message
router.post('/:username/new/message', (req, res, next) => {
  User.findOne({'username': req.params.username}, function(err, user){
    if (err) {
      console.log( err);
    }
    const newMsg = new Message({
      subject: req.body.mailSubject,
      body: req.body.mailBody,
      date: new Date(),
      toId: user.id,
      toName:user.username,
      fromId: req.user.id,
      fromName: req.user.username,
      seen: false
    });
    newMsg.save(function(err){
      if (err) {
        console.log(err);
      }
      user.inbox.push({
        msgId: newMsg.id,
      });
      user.save();
      res.redirect('/home');
    })
  })
});

// Read One Message
router.get('/read/:id',isLoggedIn, (req, res, next) => {
  var seenMail = {
    seen: true
  }
  Message.findOneAndUpdate({'_id': req.params.id}, seenMail)
  .then(function(mail){
    Message.findOne({'_id': req.params.id}, function(err, mail){
      if (err) {
        console.log(err);
      }
      res.render('mail/single', { mail:mail, user: req.user, title: ''});
    })
  });
});

// Delete One Message
router.post('/remove/:id', (req, res, next) => {
  User.updateOne(req.user, {$pull: {inbox: {msgId :req.params.id }}}, function(err, user) {
    if (err) {
      res.send(err);
    }
    Message.findOneAndDelete({'_id': req.params.id},  function(err, doc) {
      if (err) {
        res.send(err)
      }
      res.redirect('/inbox/all');
    });
  });
});



function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('login');
}


module.exports = router;
