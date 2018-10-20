const express = require('express');
const router = express.Router();
const config = require('../lib');
const stripe = require('stripe')(config.Stripe_Test_Key);
const User = require('../models/User');

router.post('/paynow', (req, res, next) => {
  var amt = req.body.amount;
  // let payHTMLForm = `
  // <div class="card-body">
  //     <form action="/stripe/charge/thirty" method="POST">
  //       <input type="text" name="amount" value="">
  //         <script class="stripe-button"
  //         src="https://checkout.stripe.com/checkout.js"
  //         data-email="trifectaejournal@gmail.com"
  //         data-key="pk_test_mqsHIcQhk7MQsVdWM21RbvOp"
  //         data-amount="${amt}"
  //         data-name="Trifecta eJournal"
  //         data-description="Post Purchase"
  //         data-label="Purchase 1 month (30 Posts)"
  //         data-locale="en-US"></script>
  //     </form>
  // </div>`;
  res.set('Content-Type', 'text/html');
  res.send(new Buffer('<h2>Test String</h2>'));
})
router.post('/charge/thirty', (req, res) => {

  let token = req.body.stripeToken
  console.assert(token)
  const amount = req.body.amount
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
