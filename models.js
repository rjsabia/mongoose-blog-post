const mongoose = require('mongoose');

// this is our schema to represent a restaurant
const blogpostSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: String,
    lastName: String
  }
});

blogpostSchema.virtual('blogpostString').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim()});

blogpostSchema.methods.apiRepr = function() {

  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.blogpostString
  };
}
const Blogpost = mongoose.model('Blogpost', blogpostSchema);

module.exports = {Blogpost};
