const express = require('express');
const router = express.Router();
const moment = require('moment');
const Entry = require('../models/Entry');
const User = require('../models/User');
const Message = require('../models/Message');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('Z1%UrQ7_d6F@3E!db2eg');

router.get('/all', (req, res, next) => {
  res.render('mail/allMail')
});

module.exports = router;
