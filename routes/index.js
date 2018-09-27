const express = require('express');
const router = express.Router();
const passport = require('passport');
const Entry = require('../models/entry');
const User = require('../models/user');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('Z1%UrQ7_d6F@3E!db2eg');
const charge = require('../charge');
const keyPublish = 'pk_test_mqsHIcQhk7MQsVdWM21RbvOp';
const keySecret = 'sk_test_MH29dqvmnJeafJIZPiJ1SmCt';
const stripe = require('stripe')(keySecret);

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
//       customer: customer.id,
//       source: req.body.stripeToken
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


/* Render Home Page */
router.get('/', (req, res) => {
  res.render('index', {text: "Yo yo peeps!", title:""});
});

/* GET Home Page */
router.get('/home', isLoggedIn, (req, res) => {
  User.findById({'_id': req.user.id}, function(err, user){
    Entry.find({'authorId': user.id}, function(err, entries){
      if (err) {
        res.send(err);
      }
      for (var i = 0; i < entries.length; i++) {
        entries[i].subject = cryptr.decrypt(entries[i].subject);
        entries[i].body = cryptr.decrypt(entries[i].body)
      }
      res.render('home', {entry: entries, text: "",title: 'Trifecta eJournal', docs: '', profile: ''});
    })
  });
});

/* Render Register Form */
router.get('/register', (req, res) => {
  res.render('register');
});

/* POST Rregister New User */
router.post('/register', (req, res) => {
  User.register(new User({
    username: req.body.username,
    balance: 0
  }),req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.render('register')
    }
    passport.authenticate('local')(req, res, function(){
      res.redirect('/home')
    });
  });
});

/* Render Login Page */
router.get('/login', (req, res) => {
  res.render('login');
});

/* POST Sign In */
router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login'
}), (req, res) => {

});

/* GET Log Out Page*/
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/no_credit', (req, res, next) => {
  res.render('nocredit', {title: ''})
});



function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('login');
}


module.exports = router;
