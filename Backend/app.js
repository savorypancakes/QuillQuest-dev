// backend/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const promptRoutes = require('./routes/prompts');
const replyRoutes = require('./routes/replies');
const notificationRoutes = require('./routes/notifications');
const resetPasswordRoute = require('./routes/resetPassword');

// Config route for frontend
const configRoute = express.Router();
configRoute.get('/', (req, res) => {
  // Only expose necessary configuration
  res.json({
    GROQ_API_KEY: process.env.REACT_APP_GROQ_API_KEY,
    API_VERSION: '1.0',
    ENVIRONMENT: process.env.NODE_ENV
  });
});

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

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/reset-password', resetPasswordRoute);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/config', configRoute);

// Add a test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Options handling for CORS preflight
app.options('*', cors());

// 404 handler - Add this before error handler
app.use((req, res, next) => {
  console.log(`404 - Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found',
    requestedPath: req.path,
    method: req.method,
    availableRoutes: {
      auth: [
        { method: 'POST', path: '/api/auth/login' },
        { method: 'POST', path: '/api/auth/register' }
      ],
      users: [
        { method: 'GET', path: '/api/users/profile' },
        { method: 'PUT', path: '/api/users/profile' }
      ],
      // Add other available routes here
    }
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  // Determine status code
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({ 
    message: 'Server Error', 
    error: process.env.NODE_ENV === 'production' ? '🥞' : err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    // Additional debug info in development
    ...(process.env.NODE_ENV !== 'production' && {
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    })
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Optionally implement notification system for critical errors
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally implement notification system for critical errors
});

module.exports = app;