const express = require('express');
const router = express.Router();
const Entry = require('../models/entry');
const User = require('../models/user');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('Z1%UrQ7_d6F@3E!db2eg');
const allStarCredit = 30 /* post every day recieve 30 'post credit bonus'*/
const shareCredit = 60;  /* Shared this and new user joined */
// const charge = require('../charge');
// const keyPublish = 'pk_test_mqsHIcQhk7MQsVdWM21RbvOp';
// const keySecret = 'sk_test_MH29dqvmnJeafJIZPiJ1SmCt';
// const stripe = require('stripe')(keySecret);

// router.post('/charge', (req, res) => {
// let amount;
//   stripe.customers.create({
//     email: req.body.email,
//     card: req.body.id
//   })
//   .then(customer =>
//     stripe.charges.create({
//       amount:10000,
//       description: "Sample Charge",
//       currency: "usd",
//       customer: customer.id
//     }))
//     .then(charge => {
//       console.log("Purchase succeeded:", charge);
//       res.send(charge);
//     })
//     .catch(err => {
//       console.log('Error: ', err);
//       res.status(500).send({error: 'Purchase Failed'});
//     });
// });



/*
  You purchase the eJournal app and recieve 30 posts or 30 days free
  noPost deductions will not be active during intial 30 day period
  number of posts will deduct upon use during period
  all posts made will earn post credits
  if all 30 consectutively used All-Star credit given
  Need 18 posts per month min to start earning post credit

  App cost - $2.99

  re-up post balance
  $3.99 - 30 posts / 1 month
  $9.99 - posts / 3 months
  $14.99 posts / 6 months
  $19.99 - 365 posts / 1 year
*/

function creditEarned(numOfDaysPosted){
  var deduct = 30 - numOfDaysPosted;
  /*
    minimum 18 posts/day gives 7.5 'post credit'
    maximum 30 posts/day gives 22.5 days of 'post credit'
   */
  var earned = numOfDaysPosted * .75;
  /*
    every day with no post made deducts 1/2 days of 'post credit'
  */
  var lost = deduct * .5;
  return earned - lost;
}
console.log(creditEarned(12));


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
