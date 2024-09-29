import React from 'react';

const PromptList = () => {
  const prompts = [
    { title: 'Prompt of the Day', question: 'Is the bald eagle the best symbol to represent the US?', remaining: 7 },
    { title: "Yesterday's Prompt", question: 'Should plastic bags be banned worldwide?', remaining: 6 },
    { title: '2 days ago', question: 'Is nuclear energy a viable solution to the world\'s energy problems?', remaining: 5 }
  ];

  return (
    <div className="prompt-list">
      {prompts.map((prompt, index) => (
        <div key={index} className="prompt">
          <h3>{prompt.title}</h3>
          <p>{prompt.question}</p>
          <span>{prompt.remaining} days remaining</span>
        </div>
      ))}
    </div>
  );
};

export default PromptList;