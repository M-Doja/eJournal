var mongoose = require('mongoose');

var entrySchema = new mongoose.Schema({
  subject: String,
      body: String,
      date: Date,
      time: String,
      image: String,
      upvotes: 0,
      downvotes: 0,
      comments: {
        body: String,
        commenterId: String
      },
      authorId: {}
});

mongoose.plugin(schema => { schema.options.usePushEach = true });


module.exports = mongoose.model('Entry', entrySchema);
