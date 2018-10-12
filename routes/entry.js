const express = require('express');
const router = express.Router();
const moment = require('moment');
const { body, validationResult } = require('express-validator/check');
const Entry = require('../models/Entry');
const User = require('../models/User');
// const Cryptr = require('cryptr');
// const cryptr = new Cryptr('Z1%UrQ7_d6F@3E!db2eg');
const allStarCredit = 30 /* post every day recieve 30 'post credit bonus'*/
const shareCredit = 60;  /* Shared this and new user joined */


/*
  THE IDEA: This serves as a personal eJournal where a user's data/posts
  are encrypted and stored securely on a database. As such this is based on
  the idea that a user is making one post per day and using this application
  as a daily journal.
  Below is a description of the initial package setup and purchase options.

  App cost - $2.99

  Initial Package:
  You purchase the eJournal app and recieve 30 posts or 30 days free
  noPost deductions will not be active during intial 30 day period
  number of posts will deduct upon use during period
  all posts made will earn post credits
  if all 30 consectutively used All-Star credit given
  Need 18 posts per month min to start earning post credit

  Purchase additional posts
  $3.99 - 30 posts / 1 month
  $9.99 - 90 posts / 3 months
  $14.99 - 180 posts / 6 months
  $19.99 - 365 posts / 1 year
*/

// RENDER POST ADDITION PAGE
router.get('/add', isLoggedIn, function(req, res, next) {
  res.render('entry/newEntry', {user: req.user,text: "",title: 'Trifecta Community eJournal', docs: '', profile: ''});
});

/* GET Entry Page */
router.get('/all', isLoggedIn, (req, res) => {
  User.findById({'_id': req.user.id}, function(err, user){
    Entry.find({}, function(err, entries){
      if (err) {
        res.send(err);
      }
      res.render('entry/allEntries', { user : req.user, entry: entries, text: "",title: 'Trifecta eJournal', docs: '', profile: ''});
    });
  });
});

// POST NEW ENTRY
router.post('/new', isLoggedIn, function(req, res, next){
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
router.get('/:id', isLoggedIn, function(req, res, next){
  var id = req.params.id;
  Entry.find({'_id': id}, function(err, entry){
    if (err) {
      res.send(err)
    }
    res.render('entry/single', { currentUser:req.user, entry: entry, title: 'eJournal', profile: ''})
  })
});

// UPDATE SINGLE ENTRY
router.post('/update/:id', function(req, res, next){
  var id = req.params.id;
  Entry.find({'_id': id},  function(err, ent){
    if (err) {
      res.send(err);
    }
    res.render('update', {user: req.user, title: 'Express-Trifecta', ent: ent });
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
router.post('/:id/vote/up' , isLoggedIn, (req, res, next) => {
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
router.post('/:id/vote/down' , isLoggedIn, (req, res, next) => {
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

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('login');
}


module.exports = router;
