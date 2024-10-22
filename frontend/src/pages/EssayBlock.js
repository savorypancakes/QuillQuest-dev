import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, ChatAlt2Icon, CheckCircleIcon, FlagIcon } from '@heroicons/react/solid';
import WritingAssistant from '../components/WritingAssistant';
import { checkEssayErrors } from '../utils/essayChecker';

// Update the ERROR_CATEGORIES constant in EssayBlock.js
const ERROR_CATEGORIES = [
  'spelling',
  'punctuation',
  'lexicoSemantic',
  'stylistic',
  'typographical'
];
const CHECK_COOLDOWN = 30; // 30 seconds cooldown

const getCategoryDisplayName = (category) => {
  const displayNames = {
    spelling: 'Spelling',
    punctuation: 'Punctuation',
    lexicoSemantic: 'Meaning & Word Choice',
    stylistic: 'Style',
    typographical: 'Typography'
  };
  return displayNames[category] || category;
};


const ProgressCircle = ({ progress, isActive }) => (
  <div className={`w-6 h-6 rounded-full ${isActive ? 'bg-purple-600' : 'bg-purple-200'} flex items-center justify-center`}>
    <div className={`w-4 h-4 rounded-full ${isActive ? 'bg-white' : 'bg-purple-600'}`} style={{ opacity: progress ? 1 : 0.3 }}></div>
  </div>
);

const SidebarItem = ({ title, progress, isActive, isLast }) => (
  <div className="flex items-center space-x-3 py-2">
    <div className="relative">
      <ProgressCircle progress={progress} isActive={isActive} />
      {!isLast && <div className="absolute top-6 left-3 w-0.5 h-full bg-purple-200"></div>}
    </div>
    <span className={`text-gray-700 ${isActive ? 'font-bold' : ''}`}>{title}</span>
  </div>
);

export default function EssayBlock() {
  const { sectionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { section, allSections, essayInfo } = location.state || {};

  const [essayContent, setEssayContent] = useState('');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isChecking, setIsChecking] = useState(false);
  const [activeErrorCategory, setActiveErrorCategory] = useState('Spelling');
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [score, setScore] = useState(0);
  const [showErrorPanel, setShowErrorPanel] = useState(false);

  useEffect(() => {
    const savedContent = localStorage.getItem(`essayContent_${sectionId}`);
    if (savedContent) {
      setEssayContent(savedContent);
    }
  }, [sectionId]);

  useEffect(() => {
    if (essayContent.trim()) {
      localStorage.setItem(`essayContent_${sectionId}`, essayContent);
    }
  }, [sectionId, essayContent]);

  const toggleAssistant = () => setIsAssistantOpen(!isAssistantOpen);

  const handleCheck = async () => {
    const now = Date.now();
    if (now - lastCheckTime < CHECK_COOLDOWN * 1000) {
      const remainingTime = Math.ceil((CHECK_COOLDOWN * 1000 - (now - lastCheckTime)) / 1000);
      alert(`Please wait ${remainingTime} seconds before checking again.`);
      return;
    }

    if (!essayContent.trim()) {
      alert('Please write something before checking for errors.');
      return;
    }

    setIsChecking(true);
    try {
      const categorizedErrors = await checkEssayErrors(essayContent);
      setErrors(categorizedErrors);
      setLastCheckTime(now);
      setShowErrorPanel(true); // Show error panel after checking

      const totalErrors = Object.values(categorizedErrors).flat().length;
      const newScore = Math.max(0, score + (10 - totalErrors));
      setScore(newScore);

      if (totalErrors === 0) {
        alert('Great job! No errors found in this section. 🎉');
      }
    } catch (error) {
      console.error('Error checking essay:', error);
      alert('Sorry, there was a problem checking your essay. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleComplete = () => {
    const updatedSections = allSections?.map(s => 
      s.id === section?.id ? { ...s, percentage: 100 } : s
    );
    navigate('/essaybuilder', { 
      state: { 
        updatedSections,
        essayInfo
      } 
    });
  };

  const renderErrorPanel = () => {
    if (!errors[activeErrorCategory]?.length) {
      return (
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-green-600">
            Great work! No {activeErrorCategory.toLowerCase()} errors found.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {errors[activeErrorCategory].map((error, index) => (
          <div key={index} className="p-4 bg-white rounded-lg shadow">
            <p className="font-medium text-gray-800">{error.message}</p>
            {error.text && (
              <p className="mt-2 text-red-600">
                Text: "{error.text}"
              </p>
            )}
            {error.suggestions?.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Suggestions:</p>
                <ul className="list-disc list-inside">
                  {error.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-green-600">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-purple-600 cursor-pointer" onClick={() => navigate('/essaybuilder', { state: { essayInfo } })}>
            <HomeIcon className="h-6 w-6" />
            <span>Return to Essay Builder</span>
          </div>
        </div>
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold">{section?.title}</h2>
        </div>
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold mb-2">Essay Information</h3>
          <p className="text-sm"><strong>Prompt:</strong> {essayInfo?.prompt}</p>
          <p className="text-sm"><strong>Title:</strong> {essayInfo?.title}</p>
          <p className="text-sm"><strong>Post Type:</strong> {essayInfo?.postType}</p>
        </div>
        <div className="p-4 flex-grow">
          <h3 className="font-semibold mb-2">Essay Progress</h3>
          {allSections?.map((s, index) => (
            <SidebarItem 
              key={s.id}
              title={s.title} 
              progress={s.percentage === 100}
              isActive={s.id === sectionId}
              isLast={index === allSections.length - 1}
            />
          ))}
        </div>
      </div>

      <div className="flex-grow flex flex-col">
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{section?.title}</h1>
          <div className="flex items-center space-x-4">
            <div className="text-purple-600 font-bold">
              Score: {score}
            </div>
            <button 
              className="bg-purple-600 text-white px-4 py-2 rounded-full flex items-center"
              onClick={toggleAssistant}
            >
              <ChatAlt2Icon className="h-5 w-5 mr-2" />
              WRITING ASSISTANT
            </button>
          </div>
        </header>

        <div className="flex-grow p-6 overflow-auto">
          <div className={`grid ${showErrorPanel ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
            <div className="bg-white rounded-lg shadow p-4">
              <textarea
                value={essayContent}
                onChange={(e) => setEssayContent(e.target.value)}
                className="w-full h-full min-h-[500px] resize-none focus:outline-none"
                placeholder={`Start writing your ${section?.title} here...`}
              />
            </div>
            
            {showErrorPanel && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="flex space-x-2">
                    {ERROR_CATEGORIES.map(category => (
                      <button
                        key={category}
                        onClick={() => setActiveErrorCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          activeErrorCategory === category
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {getCategoryDisplayName(category)}
                      </button>
                    ))}
                  </div>
                </div>
                {renderErrorPanel()}
              </div>
            )}
          </div>
        </div>

        <footer className="bg-white border-t border-gray-200 h-16 flex items-center justify-end px-6">
          <button
            onClick={handleCheck}
            className="bg-blue-500 text-white px-6 py-2 rounded-full mr-4 flex items-center"
            disabled={isChecking}
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {isChecking ? 'Checking...' : 'Check'}
          </button>
          <button
            onClick={handleComplete}
            className="bg-green-500 text-white px-6 py-2 rounded-full flex items-center"
          >
            <FlagIcon className="h-5 w-5 mr-2" />
            Complete
          </button>
        </footer>

        <WritingAssistant 
          isOpen={isAssistantOpen} 
          onClose={toggleAssistant} 
          sectionType={section?.title}
          essayInfo={essayInfo}
          currentContent={essayContent}
        />
      </div>
    </div>
  );
}