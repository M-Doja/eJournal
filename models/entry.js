var mongoose = require('mongoose');
const User = require('./User');

var entrySchema = new mongoose.Schema({
  subject: String,
      body: String,
      date: Date,
      time: String,
      image: String,
      upvotes: [{
        voterId: String
      }],
      downvotes: [{
        voterId: String
      }],
      comments: {
        body: String,
        commenterId: String
      },
      authorId: {}
});

mongoose.plugin(schema => { schema.options.usePushEach = true });


module.exports = mongoose.model('Entry', entrySchema);
