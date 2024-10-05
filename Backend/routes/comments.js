// backend/routes/comments.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment
} = require('../controllers/commentController');

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post('/', protect, createComment);

// @route   GET /api/comments/post/:postId
// @desc    Get all comments for a post
// @access  Public
router.get('/post/:postId', getCommentsByPost);

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', protect, updateComment);

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', protect, deleteComment);

module.exports = router;
