import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function EssayGuidance() {
  const [title, setTitle] = useState('');
  const [postType, setPostType] = useState('discussion');
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await api.get('/prompts/all');
        setPrompts(response.data);
      } catch (error) {
        console.error('Error fetching prompts:', error);
      }
    };
    fetchPrompts();
  }, []);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handlePostTypeSelection = (type) => {
    setPostType(type);
  };

  const handlePromptSelection = (e) => {
    setSelectedPrompt(e.target.value);
  };

  const handleNext = () => {
    const essayInfo = {
      title,
      postType,
      prompt: prompts.find(p => p._id === selectedPrompt)?.topic || ''
    };
    navigate('/essaybuilder', { state: { essayInfo } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <span className="block text-sm font-medium text-gray-700">Post Type</span>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => handlePostTypeSelection('discussion')}
              className={`w-1/2 py-2 px-4 text-sm font-medium rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:z-10 ${
                postType === 'discussion'
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Discussion
            </button>
            <button
              type="button"
              onClick={() => handlePostTypeSelection('advice')}
              className={`w-1/2 py-2 px-4 text-sm font-medium rounded-r-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:z-10 ${
                postType === 'advice'
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Advice and Feedback
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            Prompt
          </label>
          <div className="relative">
            <select
              id="prompt"
              value={selectedPrompt}
              onChange={handlePromptSelection}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md appearance-none"
            >
              <option value="">Select Prompt</option>
              {prompts.map((prompt) => (
                <option key={prompt._id} value={prompt._id}>
                  {prompt.topic}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          Link to="/essaybuilder"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Next
        </button>
      </div>
    </div>
  );
}