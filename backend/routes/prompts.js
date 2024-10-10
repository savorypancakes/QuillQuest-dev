const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');

// Get all prompts
router.get('/all', async (req, res) => {
  console.log('Received request for all prompts');
  try {
    const prompts = await Prompt.find({ expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    console.log(`Found ${prompts.length} prompts`);
    res.json(prompts);
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

console.log('Prompts routes loaded');
module.exports = router;