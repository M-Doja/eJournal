const mongoose = require('mongoose');
const User = require('./User');
const messageSchema = new mongoose.Schema({
  subject: String,
  body: String,
  date: Date,
  seen: Boolean,
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model('Message', messageSchema);
