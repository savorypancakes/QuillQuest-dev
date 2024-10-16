// backend/routes/replies.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createReply,
  getRepliesByComment,
  deleteReply,
} = require('../controllers/replyController');
const {
  likeComment,
  unlikeComment,
} = require('../controllers/commentController');

// @route   POST /api/comments/:commentId/replies
// @desc    Create a new reply
// @access  Private
router.post('/comments/:commentId/replies', protect, createReply);

// @route   GET /api/comments/:commentId/replies
// @desc    Get all replies for a comment
// @access  Public
router.get('/comments/:commentId/replies', getRepliesByComment);

// @route   DELETE /api/replies/:replyId
// @desc    Delete a reply
// @access  Private
router.delete('/replies/:replyId', protect, deleteReply);

// @route   PUT /api/comments/:id/like
// @desc    Like a comment
// @access  Private
router.put('/comments/:id/like', protect, likeComment);

// @route   PUT /api/comments/:id/unlike
// @desc    Unlike a comment
// @access  Private
router.put('/comments/:id/unlike', protect, unlikeComment);

module.exports = router;