require('dotenv').config();
const app = require('./app');
const { createServer } = require('./socketServer');
const connectDB = require('./config/database');
const axios = require('axios');
const Prompt = require('./models/Prompt');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Log environment variables
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('REACT_APP_GROQ_API_KEY:', process.env.REACT_APP_GROQ_API_KEY ? 'Set' : 'Not set');

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

// Create server and initialize Socket.io after MongoDB connection is established
const { server, io } = createServer(app);

// Initialize Socket.io with CORS configuration
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to other modules if needed
app.set('io', io);

// Function to generate a prompt using GROQ
const generatePrompt = async () => {
  const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
  const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

  try {
    console.log('Sending request to GROQ API...');
    const response = await axios.post(GROQ_API_URL, {
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates essay topic prompts." },
        { role: "user", content: "Generate a thought-provoking essay topic prompt suitable for high school or college students. The topic should be specific, engaging, and encourage critical thinking." }
      ],
      max_tokens: 100
    }, {
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    
    const promptTopic = response.data.choices[0].message.content.trim();
    
    const newPrompt = new Prompt({ 
      topic: promptTopic,
      expiresAt: new Date(+new Date() + 7*24*60*60*1000)
    });
    await newPrompt.save();
    
    console.log('New prompt saved:', promptTopic);
    return promptTopic;
  } catch (error) {
    console.error('Error generating prompt with GROQ:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Schedule prompt generation to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingPrompt = await Prompt.findOne({ createdAt: { $gte: today } });

    if (!existingPrompt) {
      console.log('Attempting to generate new prompt...');
      const newPromptTopic = await generatePrompt();
      console.log('Prompt generated:', newPromptTopic);
      
      const newPrompt = new Prompt({ 
        topic: newPromptTopic,
        expiresAt: new Date(+new Date() + 7*24*60*60*1000) // 7 days from now
      });
      await newPrompt.save();
      console.log('New prompt saved to database');

      io.emit('newPrompt', newPrompt);
      console.log('New prompt emitted to clients');
    } else {
      console.log('A prompt has already been generated today.');
    }
  } catch (error) {
    console.error('Error in prompt generation cycle:', error);
  }
});

// Add this near your other cron jobs
cron.schedule('0 0 * * *', async () => {
  try {
    const result = await Prompt.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log(`Deleted ${result.deletedCount} expired prompts`);
  } catch (error) {
    console.error('Error deleting expired prompts:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  cron.getTasks().forEach(task => task.stop());
  server.close(() => {
    console.log('HTTP server closed');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  const flagFile = path.join(__dirname, 'prompts_deleted.flag');
  
  if (!fs.existsSync(flagFile)) {
    try {
      const result = await Prompt.deleteMany({});
      console.log(`All existing prompts have been deleted. Count: ${result.deletedCount}`);
      
      fs.writeFileSync(flagFile, 'Prompts were deleted on ' + new Date().toISOString());
    } catch (error) {
      console.error('Error during prompt deletion:', error);
    }
  } else {
    console.log('Prompts have already been deleted in a previous run. Skipping deletion.');
  }
});

// Error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
