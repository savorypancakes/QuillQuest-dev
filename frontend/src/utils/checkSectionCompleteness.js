import { ChatGroq } from "@langchain/groq";

const evaluateCriteria = {
  introduction: `
    - Clear thesis statement present
    - Sufficient background context
    - Main points clearly outlined
    - Engaging opening
  `,
  bodyParagraph: `
    - Clear topic sentence that directly supports the thesis
    - Strong supporting evidence and examples
    - Thorough analysis explaining the evidence
    - Clear connection back to thesis/main argument
    - Smooth transitions between ideas
    - Proper paragraph structure and organization
  `,
  conclusion: `
    - Effective restatement of thesis
    - Comprehensive summary of main points
    - Meaningful final insights or implications
    - Strong closing statement
    - Clear sense of closure
    - No new arguments introduced
  `
};

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
    const parsedResponse = JSON.parse(response.content);
    if (!parsedResponse.mainPoints || !Array.isArray(parsedResponse.mainPoints)) {
      throw new Error('Invalid thesis points structure');
    }
    return parsedResponse;
  } catch (error) {
    console.error('Error parsing thesis points:', error);
    throw new Error('Failed to parse thesis points');
  }
};

// Function to generate new body sections
export const generateBodySections = (mainPoints) => {
  if (!Array.isArray(mainPoints)) {
    throw new Error('Invalid main points structure');
  }
  
  return mainPoints.map((point, index) => ({
    id: `body-${Date.now()}-${index + 1}`,
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

  // Determine the section type and get appropriate criteria
  let criteria;
  if (sectionType.toLowerCase().includes('introduction')) {
    criteria = evaluateCriteria.introduction;
  } else if (sectionType.toLowerCase().includes('body paragraph')) {
    criteria = evaluateCriteria.bodyParagraph;
  } else if (sectionType.toLowerCase().includes('conclusion')) {
    criteria = evaluateCriteria.conclusion;
  } else {
    throw new Error('Invalid section type');
  }

  const systemMessage = {
    role: 'system',
    content: `You are a JSON-only response analyzer for essays. Your task is to evaluate the given ${sectionType} section and return a strict JSON object.

IMPORTANT: DO NOT include any explanatory text. Return ONLY a valid JSON object matching this structure:
{
  "isComplete": false,
  "completionStatus": {
    "met": [],
    "missing": []
  },
  "feedbackItems": [],
  "suggestedImprovements": []
}

Evaluate against these criteria:
${criteria}

Rules:
1. isComplete must be true ONLY if ALL criteria are met
2. met array should contain criteria that were successfully fulfilled
3. missing array should contain criteria that need improvement
4. feedbackItems should contain specific issues found
5. suggestedImprovements should contain actionable suggestions`
  };

  const userMessage = {
    role: 'user',
    content: `${content}`
  };

  try {
    const response = await llm.invoke([systemMessage, userMessage]);
    
    // Try to extract JSON if there's any extra text
    let jsonStr = response.content;
    if (jsonStr.includes('{')) {
      jsonStr = jsonStr.substring(jsonStr.indexOf('{'), jsonStr.lastIndexOf('}') + 1);
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse response:', jsonStr);
      // Return a default response structure
      return {
        isComplete: false,
        completionStatus: {
          met: [],
          missing: ['Failed to analyze section - please try again']
        },
        feedbackItems: ['Analysis failed - please revise and try again'],
        suggestedImprovements: ['Please try submitting again']
      };
    }

    // Validate and normalize the response
    const normalizedResponse = {
      isComplete: false,
      completionStatus: {
        met: Array.isArray(parsedResponse?.completionStatus?.met) 
          ? parsedResponse.completionStatus.met 
          : [],
        missing: Array.isArray(parsedResponse?.completionStatus?.missing) 
          ? parsedResponse.completionStatus.missing 
          : ['Requirements need to be checked again']
      },
      feedbackItems: Array.isArray(parsedResponse?.feedbackItems) 
        ? parsedResponse.feedbackItems 
        : [],
      suggestedImprovements: Array.isArray(parsedResponse?.suggestedImprovements) 
        ? parsedResponse.suggestedImprovements 
        : []
    };

    // Force isComplete to false if there are missing criteria
    normalizedResponse.isComplete = normalizedResponse.completionStatus.missing.length === 0;

    return normalizedResponse;

  } catch (error) {
    console.error('Error during section analysis:', error);
    // Return a graceful fallback response instead of throwing
    return {
      isComplete: false,
      completionStatus: {
        met: [],
        missing: ['Analysis failed - please try again']
      },
      feedbackItems: ['Unable to complete analysis'],
      suggestedImprovements: ['Please revise and try submitting again']
    };
  }
};