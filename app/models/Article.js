// grab the mongoose module
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define our model
var ArticleSchema = new Schema({
  name: String,
  body: String,
  updated: { type: Date, default: Date.now }
});

// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Article', ArticleSchema);
