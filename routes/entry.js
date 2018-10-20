const express = require('express');
const router = express.Router();
const moment = require('moment');
const { body, validationResult } = require('express-validator/check');
const Entry = require('../models/Entry');
const User = require('../models/User');
const Mid = require('../middleware');

// RENDER POST ADDITION PAGE
router.get('/add', Mid.isLoggedIn, function(req, res, next) {
  res.render('entry/newEntry', {user: req.user,text: "",title: 'Link Connect', docs: '', profile: ''});
});

/* GET Entry Page */
router.get('/all', Mid.isLoggedIn, (req, res) => {
  User.findById({'_id': req.user.id}, function(err, user){
    // var x = Entry.find().sort({time: -1});
    // console.log("X is", x.entries);
    Entry.find({}, function(err, entries){
      if (err) {
        res.send(err);
      }
      res.render('entry/allEntries', { user : req.user, entry: entries, text: "",title: 'Link Connect', docs: '', profile: ''});
    }).sort({time: -1});
  });
});

// POST NEW ENTRY
router.post('/new', Mid.isLoggedIn, function(req, res, next){
  var entry = new Entry({
    subject: req.body.subject,
    body: req.body.body,
    date: new Date().toLocaleDateString(),
    time: new Date().getTime(),
    authorId: req.user.id
  });
  User.findById({'_id': req.user.id}, function(err, user){
    if (err) {
      return res.send(err);
    }
    // ONLY 3 POSTS ALLOWED
    if (user.entries.length < 3) {

      entry.save(function(err, entry){
        if (err) {
          return res.send(err);
        }

        user.balance += .75;
        user.entries.push({
          entryId: entry.id,
          entryDate: entry.date.getDate()
        });
        user.save(function(err){
          if (err) {
            return console.log(err);
          }
        });
        res.redirect('/home');

      }); // End of Entry Save fn
    }else {
      res.redirect('/no_credit');
    }
  })
});

// GET SINGLE ENTRY
router.get('/:id', Mid.isLoggedIn, function(req, res, next){
  var id = req.params.id;
  Entry.find({'_id': id}, function(err, entry){
    if (err) {
      res.send(err)
    }
    res.render('entry/single', { user: req.user,currentUser:req.user, entry: entry, title: 'Link Connect', profile: ''})
  })
});

// UPDATE SINGLE ENTRY
router.post('/update/:id', Mid.isLoggedIn, function(req, res, next){
  var id = req.params.id;
  Entry.find({'_id': id},  function(err, ent){
    if (err) {
      res.send(err);
    }
    res.render('entry/update', {user: req.user, title: 'Link Connect', ent: ent });
  })
});

/* SAVE UPDATED ENTRY */
router.post('/dataUpdate/:id', Mid.isLoggedIn, function(req, res, next){
  var updatedEntry = {
    subject: req.body.subjectUpdate,
    body: req.body.bodyUpdate
  };
  Entry.findOneAndUpdate({'_id': req.params.id}, updatedEntry)
  .then(function(entry){
    Entry.findOne({'_id': req.params.id})
    .then(function(newEntry){
      res.redirect(`/entries/${newEntry.id}`)
    })
  });
});

/* DELETE ENTRY BY ID */
router.post('/delete/:id', Mid.isLoggedIn, function(req, res, next){
  User.updateOne(req.user, {$pull: {entries: {entryId :req.params.id }}}, function(err, user) {
    if (err) {
      console.log(err);
    }
    Entry.findOneAndDelete({'_id': req.params.id},  function(err, doc) {
      if (err) {
        res.send(err)
      }
      res.redirect('/home')
    });
  });
});

// Vote Entry Up
router.post('/:id/vote/up' , Mid.isLoggedIn, (req, res, next) => {
  var voteDn, voteUp;

  Entry.findById({'_id': req.params.id}, function(err, singleEntry) {
    for (var i = 0; i < singleEntry.upvotes.length; i++) {
      if (req.user.id === singleEntry.upvotes[i].voterId) {
        console.log('You Already Voted Up');
        voteUp = true;
      }
    }

    for (var i = 0; i < singleEntry.downvotes.length; i++) {
      if (req.user.id === singleEntry.downvotes[i].voterId) {
        console.log('You Already Voted Down');
        voteDn = true;
      }
    }
    if (voteDn) {
      Entry.updateOne(singleEntry, {$pull: {downvotes: {voterId: req.user.id}}}, (err, result) => {
        // console.log("result: ", result);
      });
    }
    if (!voteUp) {
      singleEntry.upvotes.push({
        voterId: req.user.id
      });
    }

    singleEntry.save(function(err){
      console.log('Voted Up');
    });
    res.redirect('/entries/all');

  });
});

// Vote Entry Down
router.post('/:id/vote/down' , Mid.isLoggedIn, (req, res, next) => {
  var voteUp, voteDn;
  Entry.findById({'_id': req.params.id}, function(err, singleEntry){
    for (var i = 0; i < singleEntry.upvotes.length; i++) {
      if (req.user.id === singleEntry.upvotes[i].voterId) {
        console.log('You Already Voted Up');
        voteUp = true;
      }
    }

    for (var i = 0; i < singleEntry.downvotes.length; i++) {
      if (req.user.id === singleEntry.downvotes[i].voterId) {
        console.log('You Already Voted Down');
        voteDn = true;
      }
    }

    if (voteUp) {
      Entry.updateOne(singleEntry, {$pull: {upvotes: {voterId: req.user.id}}}, (err, result) => {
        // console.log("result: ", result);
      });
    }
    if (!voteDn) {
      singleEntry.downvotes.push({
        voterId: req.user.id
      });
    }

    singleEntry.save(function(err){
      console.log('Voted Down');
    });
    res.redirect('/entries/all');
  })
});


module.exports = router;
