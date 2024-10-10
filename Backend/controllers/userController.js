// backend/controllers/userController.js

const User = require('../models/User');

// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId); // From protect middleware
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user's profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const user = req.user; // From protect middleware
    const { username, email, password, avatar } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;
    if (password) user.password = password; // Will be hashed via pre-save hook

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};
