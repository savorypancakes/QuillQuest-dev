const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const promptRoutes = require('./routes/prompts');
const replyRoutes = require('./routes/replies');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api', replyRoutes);

// Add a test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: 'Server Error', 
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

module.exports = app;