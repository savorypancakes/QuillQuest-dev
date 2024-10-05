// backend/controllers/commentController.js

const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res, next) => {
  const { postId, content, parentCommentId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = new Comment({
      post: postId,
      author: req.user._id,
      content,
      parentComment: parentCommentId || null
    });

    const savedComment = await newComment.save();

    // Add comment to post's replies
    post.replies.push(savedComment._id);
    await post.save();

    // Emit event to notify clients about the new comment
    const io = req.app.get('io');
    io.emit('newComment', savedComment);

    res.status(201).json(savedComment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
exports.getCommentsByPost = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username avatar')
      .populate('parentComment')
      .sort({ createdAt: 1 }); // Oldest first
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
  const { content } = req.body;
  try {
    let comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this comment' });
    }

    comment.content = content || comment.content;

    const updatedComment = await comment.save();

    res.json(updatedComment);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    let comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.remove();

    // Remove comment from post's replies
    const post = await Post.findById(comment.post);
    if (post) {
      post.replies = post.replies.filter(
        (replyId) => replyId.toString() !== req.params.id
      );
      await post.save();
    }

    res.json({ message: 'Comment removed' });
  } catch (error) {
    next(error);
  }
};
