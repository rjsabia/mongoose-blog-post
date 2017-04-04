const mongoose = require('mongoose');

// this is our schema to represent a restaurant
const blogpostSchema = mongoose.Schema({
  author: {
    firstName: String,
    lastName: String
  },
  title: {type: String, required: true},
  content: {type: String},
  created: {type: Date, default: Date.now}
});

blogpostSchema.virtual('blogpostString').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim()});

blogpostSchema.methods.apiRepr = function() {

  return {
    id: this._id,
    author: this.blogpostString,
    title: this.title,
    content: this.content,
    created: this.created
  };
}
const Blogpost = mongoose.model('blogpost', blogpostSchema, 'blogpost');

module.exports = {Blogpost};
