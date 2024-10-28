import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatAlt2Icon, 
  CheckCircleIcon, 
  EyeIcon, 
  EyeOffIcon,
  PaperAirplaneIcon 
} from '@heroicons/react/solid';
import WritingAssistant from '../components/WritingAssistant';
import { checkEssayErrors } from '../utils/essayChecker';
import CompletionButton from '../components/CompletionButton';
import api from '../services/api';

export const EssayReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { allSections, essayInfo } = location.state || {};
  const [isPosting, setIsPosting] = useState(false);
  const [showWritingAssistant, setShowWritingAssistant] = useState(false);

  // Combine all sections into one content
  const fullEssayContent = allSections
    ?.map(section => localStorage.getItem(`essayContent_${section.id}`))
    .filter(Boolean)
    .join('\n\n');

  const handlePost = async () => {
    try {
      setIsPosting(true);
      await api.post('/posts', {
        title: essayInfo.title,
        content: fullEssayContent,
        postType: essayInfo.postType,
        prompt: essayInfo.promptId // Make sure to pass the prompt ID
      });
      
      // Redirect to posts page or show success message
      navigate('/posts');
    } catch (error) {
      console.error('Error posting essay:', error);
      alert('Failed to post essay. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/essaybuilder')} 
              className="text-purple-600 hover:text-purple-700"
            >
              <HomeIcon className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-semibold">{essayInfo?.title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowWritingAssistant(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-full flex items-center"
            >
              <ChatAlt2Icon className="h-5 w-5 mr-2" />
              WRITING ASSISTANT
            </button>
            <button
              onClick={handlePost}
              disabled={isPosting}
              className="bg-green-600 text-white px-6 py-2 rounded-full flex items-center"
            >
              <PaperAirplaneIcon className="h-5 w-5 mr-2" />
              {isPosting ? 'Posting...' : 'Post Essay'}
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              <div className="prose max-w-none">
                {allSections?.map((section, index) => (
                  <div key={section.id} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                    <div className="whitespace-pre-wrap">
                      {localStorage.getItem(`essayContent_${section.id}`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Writing Assistant Modal */}
      <WritingAssistant 
        isOpen={showWritingAssistant}
        onClose={() => setShowWritingAssistant(false)}
        content={fullEssayContent}
        essayInfo={essayInfo}
      />
    </div>
  );
};