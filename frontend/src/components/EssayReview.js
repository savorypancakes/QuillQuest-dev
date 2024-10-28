import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatAlt2Icon, 
  PaperAirplaneIcon 
} from '@heroicons/react/solid';
import { AuthContext } from '../context/AuthContext';
import WritingAssistant from '../components/WritingAssistant';
import api from '../services/api';

export const EssayReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { allSections, essayInfo } = location.state || {};
  const [isPosting, setIsPosting] = useState(false);
  const [showWritingAssistant, setShowWritingAssistant] = useState(false);

  const fullEssayContent = allSections
    ?.map(section => localStorage.getItem(`essayContent_${section.id}`))
    .filter(Boolean)
    .join('\n\n');

  const handlePost = async () => {
    // Check if user is logged in
    if (!auth?.token) {
      alert('Please log in to post your essay');
      navigate('/login', { state: { from: location } });
      return;
    }

    // Validate content
    if (!fullEssayContent) {
      alert('Cannot post empty essay');
      return;
    }

    // Validate required fields
    if (!essayInfo?.title || !essayInfo?.postType) {
      alert('Missing required essay information');
      return;
    }

    try {
      setIsPosting(true);
      
      const postData = {
        title: essayInfo.title,
        content: fullEssayContent,
        postType: essayInfo.postType,
        prompt: essayInfo.promptId || null
      };

      console.log('Posting essay with data:', postData); // Debug log

      const response = await api.post('/api/posts', postData);

      if (response.data) {
        console.log('Post successful:', response.data); // Debug log
        
        // Clear local storage after successful post
        allSections?.forEach(section => {
          localStorage.removeItem(`essayContent_${section.id}`);
          localStorage.removeItem(`sectionRequirements_${section.id}`);
        });

        // Navigate to posts page with success message
        navigate('/posts', { 
          replace: true, 
          state: { message: 'Essay posted successfully!' } 
        });
      }
    } catch (error) {
      console.error('Error posting essay:', error.response || error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        navigate('/login', { state: { from: location } });
      } else if (error.response?.status === 400) {
        alert(error.response.data.message || 'Invalid essay data. Please check all fields.');
      } else if (error.response?.status === 413) {
        alert('Essay content is too large. Please try shortening it.');
      } else {
        alert('Failed to post essay. Please try again later.');
      }
    } finally {
      setIsPosting(false);
    }
  };

  // Add a debug button in development
  const debugPost = () => {
    console.log('Current auth:', auth);
    console.log('Essay info:', essayInfo);
    console.log('Content length:', fullEssayContent?.length);
    console.log('All sections:', allSections);
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
              className="bg-green-600 text-white px-6 py-2 rounded-full flex items-center disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-5 w-5 mr-2" />
              {isPosting ? 'Posting...' : 'Post Essay'}
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={debugPost}
                className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm"
              >
                Debug
              </button>
            )}
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