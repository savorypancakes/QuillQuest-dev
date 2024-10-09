const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 60000, // Increase timeout to 60 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 60000,
    });
    console.log('MongoDB Connected');

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any servers in your MongoDB Atlas cluster. Make sure your current IP address is on your Atlas cluster\'s IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/');
    }
    throw error;
  }
};

module.exports = connectDB;