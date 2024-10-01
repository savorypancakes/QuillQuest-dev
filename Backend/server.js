// backend/server.js

const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Adjust based on your frontend URL
    methods: ['GET', 'POST']
  }
});

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join user-specific rooms if needed
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to other modules
app.set('io', io);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
