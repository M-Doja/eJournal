const express = require('express');
const router = express.Router();
const Entry = require('../models/entry');
const User = require('../models/user');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('Z1%UrQ7_d6F@3E!db2eg');



// POST NEW ENTRY
router.post('/new', isLoggedIn, function(req, res, next){
  var eSub = cryptr.encrypt(req.body.subject);
  var eBod = cryptr.encrypt(req.body.body);
  var entry = new Entry({
    subject: eSub,
    body: eBod,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    authorId: req.user.id
  });
  User.findById({'_id': req.user.id}, function(err, user){
    if (err) {
      return res.send(err);
    }
    if (user.entries.length < 2) {
      entry.save(function(err, entry){
        if (err) {
          return res.send(err);
        }
        user.entries.push(entry.id);
        user.save(function(err){
          if (err) {
            return console.log(err);
          }
        });
        res.redirect('/home');
      });
    }else {
      res.redirect('/no_credit');
    }



  })
});

// GET SINGLE ENTRY
router.get('/:id', isLoggedIn, function(req, res, next){
  var id = req.params.id;
  Entry.find({'_id': id}, function(err, entry){
    if (err) {
      res.send(err)
    }
    entry[0].subject = cryptr.decrypt(entry[0].subject);
    entry[0].body = cryptr.decrypt(entry[0].body)
    res.render('single', {entry: entry, title: 'eJournal', profile: ''})
  })
});

// UPDATE SINGLE ENTRY
router.post('/update/:id', function(req, res, next){
  var id = req.params.id;
  Entry.find({'_id': id},  function(err, ent){
    if (err) {
      res.send(err);
    }
    res.render('update', { title: 'Express-Trifecta', ent: ent });
  })
});

/* SAVE UPDATED ENTRY */
router.post('/dataUpdate/:id', function(req, res, next){
  var updatedEntry = {
    subject: req.body.subjectUpdate,
    body: req.body.bodyUpdate
  };
  Entry.findOneAndUpdate({'_id': req.params.id}, updatedEntry)
  .then(function(entry){
    Entry.findOne({'_id': req.params.id})
    .then(function(newEntry){
      res.redirect('/home')
    })
  });
});

/* DELETE ENTRY BY ID */
router.post('/delete/:id', function(req, res, next){
    User.findById(req.user.id, function(err, user) {
      for (let i = 0; i < user.entries.length; i++) {
        if (user.entries[i] == req.params.id ) {
          user.entries.splice([i], 1);
          user.save();
        }
      }
    });
    Entry.findByIdAndRemove(req.params.id,  function(err, doc) {
      if (err) {
        res.send(err)
      }
      res.redirect('/home')
    });
});


function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('login');
}


module.exports = router;
