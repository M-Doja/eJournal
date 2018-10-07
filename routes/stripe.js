const express = require('express');
const router = express.Router();
const config = require('../lib');
const stripe = require('stripe')(config.Stripe_Test_Key);

router.post('/charge/thirty', (req, res) => {
  let token = req.body.stripeToken
  console.assert(token)
  const amount = 399
  stripe.charges.create({
    amount: amount,
    currency: 'usd',
    source: token,
    description: 'Post Purchase'
  }, (err, charge) => {
    if (err) {
      res.redirect('/payment-failure?err_msg=' + err.message)
    } else {
      console.log('Charged successful')
			console.log('charge', charge)
      res.redirect('/payment-success')
    }
  })
});

router.post('/charge/ninety', (req, res) => {
  let token = req.body.stripeToken
  console.assert(token)
  const amount = 999
  stripe.charges.create({
    amount: amount,
    currency: 'usd',
    source: token,
    description: 'Post Purchase'
  }, (err, charge) => {
    if (err) {
      res.redirect('/payment-failure?err_msg=' + err.message)
    } else {
      console.log('Charged successful')
			console.log('charge', charge)
      res.redirect('/payment-success')
    }
  })
});

router.get('/payment-success', (req, res, next) => {
  res.render('payment-success');
});

module.exports = router;
