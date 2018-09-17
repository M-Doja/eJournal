var mongoose = require('mongoose');

var entrySchema = new mongoose.Schema({
  subject: String,
      body: String,
      date: Date,
      time: String,
      authorId: {}
});

mongoose.plugin(schema => { schema.options.usePushEach = true });


module.exports = mongoose.model('Entry', entrySchema);
