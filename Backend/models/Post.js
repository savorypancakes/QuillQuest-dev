// backend/models/Post.js

const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({

  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

module.exports = mongoose.model('Post', PostSchema);
