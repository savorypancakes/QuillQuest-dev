// backend/controllers/postController.js

const Post = require('../models/Post');
const Tag = require('../models/Tag'); // If using a separate Tag model
const User = require('../models/User');
const { io } = require('../server'); // To emit events

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  const { title, content } = req.body;
  try {
    // Fetch the user from the database using the userId from the request (auth middleware)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const newPost = new Post({
      userId: user._id,
      username: user.username,
      title,
      content,
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
      .populate('title', 'centent')
      .populate('userId', 'username');
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
    // .populate({
    //   path: 'comments', // Populating comments array
    //   populate: { path: 'user', select: 'username' } // Populating user data for each comment
    // })
    .populate('userId', 'username'); // Populating the post author's data
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

// @desc    Like a post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already liked the post
    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already liked this post' });
    }

    // Add the user's ID to the likes array
    post.likes.push(req.user._id);
    await post.save();

    res.json({ message: 'Post liked', likes: post.likes.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlike a post
// @route   PUT /api/posts/:id/unlike
// @access  Private
exports.unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has not liked the post yet
    if (!post.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have not liked this post yet' });
    }

    // Remove the user's ID from the likes array
    post.likes = post.likes.filter(userId => userId.toString() !== req.user._id.toString());
    await post.save();

    res.json({ message: 'Post unliked', likes: post.likes.length });
  } catch (error) {
    next(error);
  }
};
