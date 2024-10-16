// backend/controllers/replyController.js

const Reply = require('../models/Reply');
const Comment = require('../models/Comment');

// @desc    Create a new reply
// @route   POST /api/comments/:commentId/replies
// @access  Private
exports.createReply = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Find the comment to ensure it exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Create a new reply
    const newReply = new Reply({
      commentId,
      userId,
      content,
    });

    const savedReply = await newReply.save();

    res.status(201).json(savedReply);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all replies for a comment
// @route   GET /api/comments/:commentId/replies
// @access  Public
exports.getRepliesByComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    // Find replies associated with the comment
    const replies = await Reply.find({ commentId }).populate('userId', 'username').sort({ createdAt: 1 });

    res.json(replies);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a reply
// @route   DELETE /api/replies/:replyId
// @access  Private
exports.deleteReply = async (req, res, next) => {
  try {
    const { replyId } = req.params;
    const userId = req.user._id;

    // Find the reply by ID
    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check if the user is the author of the reply
    if (reply.userId.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this reply' });
    }

    // Remove the reply from the database
    await reply.remove();

    res.json({ message: 'Reply removed successfully' });
  } catch (error) {
    next(error);
  }
};