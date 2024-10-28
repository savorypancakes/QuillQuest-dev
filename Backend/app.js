const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const promptRoutes = require('./routes/prompts');
const replyRoutes = require('./routes/replies');
const notificationRoutes = require('./routes/notifications');
const resetPasswordRoute = require('./routes/resetPassword');

// Debug middleware for prompts route
app.use('/api/prompts', (req, res, next) => {
  console.log('Prompts route accessed:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body
  });
  next();
});

// Use Routes
app.use('/api/auth', authRoutes, resetPasswordRoute);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api', replyRoutes);
app.use('/api/notifications', notificationRoutes);

// Add a test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({ 
    message: 'Server Error', 
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

module.exports = app;