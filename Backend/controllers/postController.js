// backend/controllers/postController.js

const Post = require('../models/Post');
const Tag = require('../models/Tag'); // If using a separate Tag model
const { io } = require('../server'); // To emit events

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  const { title, content } = req.body;
  try {
    const newPost = new Post({
      // author: req.user._id,
      title,
      content
      // , tags
    });

    const savedPost = await newPost.save();

    // Emit event to notify clients about the new post
    const io = req.app.get('io');
    io.emit('newPost', savedPost);

    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('title', 'centent');
      // .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'username avatar' }
      });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  const { content, tags } = req.body;
  try {
    let post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this post' });
    }

    post.content = content || post.content;
    post.tags = tags || post.tags;

    const updatedPost = await post.save();

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }

    await post.remove();

    res.json({ message: 'Post removed' });
  } catch (error) {
    next(error);
  }
};