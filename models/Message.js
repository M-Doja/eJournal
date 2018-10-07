const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  subject: String,
  body: String,
  date: Date,
  to: [{
    memberId: String
  }],
  senderId: String
});

module.exports = mongoose.model('Message', messageSchema);
