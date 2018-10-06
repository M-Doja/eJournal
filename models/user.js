var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
  username: String,
  password: String,
  balance: Number,
  joined: Date,
  avatar: String,
  payMember: false,
  followers: [],
  following: [],
  entries : []
});

mongoose.plugin(schema => { schema.options.usePushEach = true });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
