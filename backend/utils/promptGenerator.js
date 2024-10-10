const axios = require('axios');

exports.generatePrompt = async () => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: "llama3-small",
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

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating prompt with GROQ:', error);
    throw error;
  }
};