import { ChatGroq } from "@langchain/groq";

// Function to parse thesis statement and extract main points
export const parseThesisPoints = async (thesisContent) => {
  const llm = new ChatGroq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY,
    model: "llama3-70b-8192",
    temperature: 0,
    maxTokens: 1024,
  });

  const systemMessage = {
    role: 'system',
    content: `Analyze the thesis statement and extract the main points that need to be addressed in body paragraphs. Return ONLY a JSON object with this structure:
    {
      "mainPoints": [
        {
          "point": "string - the main point",
          "keywords": ["relevant keywords"],
          "suggestedEvidence": ["potential evidence types or examples to include"]
        }
      ]
    }`
  };

  const response = await llm.invoke([
    systemMessage,
    { role: 'user', content: `Extract main points from this thesis: "${thesisContent}"` }
  ]);

  try {
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error parsing thesis points:', error);
    throw new Error('Failed to parse thesis points');
  }
};

// Function to generate new body sections
export const generateBodySections = (mainPoints) => {
  return mainPoints.map((point, index) => ({
    id: `body-${index + 1}`,
    title: `Body Paragraph ${index + 1}: ${point.point}`,
    type: 'body',
    percentage: 0,
    keywords: point.keywords,
    suggestedEvidence: point.suggestedEvidence
  }));
};

// Section completeness checker
export const checkSectionCompleteness = async (content, sectionType, previousContent = null) => {
  const llm = new ChatGroq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY,
    model: "llama3-70b-8192",
    temperature: 0,
    maxTokens: 2048,
  });

  const systemMessage = {
    role: 'system',
    content: `You are an advanced essay section analyzer. Evaluate the ${sectionType} based on these criteria:

    ${sectionType.toLowerCase() === 'introduction' ? `
    - Clear thesis statement present
    - Sufficient background context
    - Main points clearly outlined
    - Engaging opening
    ` : sectionType.toLowerCase() === 'body' ? `
    - Clear topic sentence
    - Strong supporting evidence
    - Thorough analysis
    - Smooth transitions
    - Connection to thesis
    ` : `
    - Effective summary of main points
    - Thesis restatement
    - Meaningful final insight
    - Strong closing
    `}

    ${previousContent ? 'Also evaluate coherence with the previous section content provided.' : ''}

    Return ONLY a JSON object with this structure:
    {
      "isComplete": boolean,
      "completionStatus": {
        "met": ["criteria that were met"],
        "missing": ["criteria that need work"]
      },
      "feedbackItems": ["specific feedback items"],
      "thesisStatement": string (only if this is an introduction),
      "suggestedImprovements": ["specific suggestions for improvement"]
    }`
  };

  const userMessage = {
    role: 'user',
    content: `Analyze this ${sectionType}:
    ${previousContent ? `Previous section content: "${previousContent}"` : ''}
    Current section content: "${content}"`
  };

  const response = await llm.invoke([systemMessage, userMessage]);
  
  try {
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error parsing completeness check:', error);
    throw new Error('Failed to analyze section completeness');
  }
};