// backend/models/Reply.js

const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reply', ReplySchema);