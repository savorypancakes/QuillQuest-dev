require('dotenv').config();
const app = require('./app');
const { createServer } = require('./socketServer');
const connectDB = require('./config/database');
const axios = require('axios');
const Prompt = require('./models/Prompt');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Enhanced logging function
const logWithTimestamp = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Log environment variables
logWithTimestamp('Environment variables loaded:');
logWithTimestamp(`PORT: ${process.env.PORT}`);
logWithTimestamp(`MONGO_URI: ${process.env.MONGO_URI ? 'Set' : 'Not set'}`);
logWithTimestamp(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
logWithTimestamp(`GROQ_API_KEY: ${process.env.REACT_APP_GROQ_API_KEY ? 'Set' : 'Not set'}`);

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

const { server, io } = createServer(app);

io.on('connection', (socket) => {
  logWithTimestamp(`New client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    logWithTimestamp(`Client disconnected: ${socket.id}`);
  });
});

app.set('io', io);

// Function to generate a prompt using GROQ
const generatePrompt = async () => {
  const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
  const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

  try {
    logWithTimestamp('Sending request to GROQ API...');
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
    
    logWithTimestamp(`New prompt generated and saved: ${promptTopic}`);
    return promptTopic;
  } catch (error) {
    logWithTimestamp(`Error generating prompt with GROQ: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    throw error;
  }
};

// Schedule prompt generation to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    logWithTimestamp('Starting daily prompt generation check...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingPrompt = await Prompt.findOne({ createdAt: { $gte: today } });

    if (!existingPrompt) {
      logWithTimestamp('No prompt generated today. Generating new prompt...');
      const newPromptTopic = await generatePrompt();
      io.emit('newPrompt', { topic: newPromptTopic });
      logWithTimestamp('New prompt emitted to clients');
    } else {
      logWithTimestamp('A prompt has already been generated today.');
    }
  } catch (error) {
    logWithTimestamp(`Error in prompt generation cycle: ${error.message}`);
  }
});

// Cleanup expired prompts daily
cron.schedule('0 0 * * *', async () => {
  try {
    logWithTimestamp('Starting cleanup of expired prompts...');
    const result = await Prompt.deleteMany({ expiresAt: { $lt: new Date() } });
    logWithTimestamp(`Deleted ${result.deletedCount} expired prompts`);
  } catch (error) {
    logWithTimestamp(`Error deleting expired prompts: ${error.message}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logWithTimestamp('SIGTERM signal received: closing HTTP server');
  cron.getTasks().forEach(task => task.stop());
  server.close(() => {
    logWithTimestamp('HTTP server closed');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  logWithTimestamp(`Server running on port ${PORT}`);
  
  const flagFile = path.join(__dirname, 'prompts_deleted.flag');
  
  if (!fs.existsSync(flagFile)) {
    try {
      const result = await Prompt.deleteMany({});
      logWithTimestamp(`All existing prompts have been deleted. Count: ${result.deletedCount}`);
      
      fs.writeFileSync(flagFile, 'Prompts were deleted on ' + new Date().toISOString());
    } catch (error) {
      logWithTimestamp(`Error during prompt deletion: ${error.message}`);
    }
  } else {
    logWithTimestamp('Prompts have already been deleted in a previous run. Skipping deletion.');
  }
});

// Error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  logWithTimestamp('Unhandled Rejection at:');
  console.error(promise);
  logWithTimestamp('Reason:');
  console.error(reason);
});