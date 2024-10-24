const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');

// Get all prompts
router.get('/all', async (req, res) => {
  console.log('Received request for all prompts');
  try {
    // First, let's see if there are any prompts at all
    const allPrompts = await Prompt.find({});
    console.log('Total prompts in database:', allPrompts.length);

    // Then get the non-expired ones
    const activePrompts = await Prompt.find({ expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    console.log('Active (non-expired) prompts:', activePrompts.length);

    res.json(activePrompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ message: 'Error fetching prompts', error: error.message });
  }
});

// Get latest prompt
router.get('/latest', async (req, res) => {
  console.log('Received request for latest prompt');
  try {
    const latestPrompt = await Prompt.findOne({ expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    console.log('Latest prompt:', latestPrompt);
    res.json(latestPrompt);
  } catch (error) {
    console.error('Error fetching latest prompt:', error);
    res.status(500).json({ message: 'Error fetching latest prompt', error: error.message });
  }
});

// Add this new route here
router.get('/create-simple-prompt', async (req, res) => {
  try {
    const newPrompt = new Prompt({
      topic: "What is your favorite book and why?",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
    await newPrompt.save();
    console.log('Created new test prompt:', newPrompt);
    res.json({ message: 'Test prompt created successfully', prompt: newPrompt });
  } catch (error) {
    console.error('Error creating test prompt:', error);
    res.status(500).json({ message: 'Error creating test prompt', error: error.message });
  }
});

console.log('Prompts routes loaded');
module.exports = router;