import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, ChatAlt2Icon, CheckCircleIcon, FlagIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/solid';
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

const ERROR_COLORS = {
  spelling: 'bg-red-200',
  punctuation: 'bg-yellow-200',
  lexicoSemantic: 'bg-orange-200',
  stylistic: 'bg-blue-200',
  typographical: 'bg-green-200'
};

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
  const [highlightedContent, setHighlightedContent] = useState('');
  const { sectionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { section, allSections, essayInfo } = location.state || {};

  const [essayContent, setEssayContent] = useState('');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isChecking, setIsChecking] = useState(false);
  const [activeErrorCategory, setActiveErrorCategory] = useState('spelling');
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [score, setScore] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  

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

  useEffect(() => {
    if (showErrors && Object.keys(errors).length > 0) {
      const highlighted = createHighlightedText(essayContent, errors);
      setHighlightedContent(highlighted);
    }
  }, [errors, essayContent, showErrors]);

  const createHighlightedText = (text, errorList) => {
    if (!text || !errorList) return '';
    
    // Add CSS for striped pattern
    const stripeStyles = `
      <style>
        .error-overlap-2 {
          background: repeating-linear-gradient(
            45deg,
            var(--color1),
            var(--color1) 10px,
            var(--color2) 10px,
            var(--color2) 20px
          );
        }
        .error-overlap-3 {
          background: repeating-linear-gradient(
            -45deg,
            var(--color1),
            var(--color1) 8px,
            var(--color2) 8px,
            var(--color2) 16px,
            var(--color3) 16px,
            var(--color3) 24px
          );
        }
      </style>
    `;
  
    // Create an array of all error positions and their metadata
    let errorPositions = [];
    Object.entries(errorList).forEach(([category, errors]) => {
      errors.forEach(error => {
        const textToReplace = error.text;
        let startIndex = 0;
        while (startIndex < text.length) {
          const index = text.indexOf(textToReplace, startIndex);
          if (index === -1) break;
          
          errorPositions.push({
            start: index,
            end: index + textToReplace.length,
            category,
            text: textToReplace,
            message: error.message,
            color: ERROR_COLORS[category]
          });
          startIndex = index + 1;
        }
      });
    });
  
    // Sort positions by start index
    errorPositions.sort((a, b) => a.start - b.start);
  
    // Find overlapping regions
    let result = stripeStyles;
    let currentOverlaps = [];
  
    // Helper function to convert Tailwind color classes to RGB values
    const getColorValues = (colorClass) => {
      const colorMap = {
        'red-200': '254, 202, 202',
        'yellow-200': '255, 255, 0',
        'orange-200': '254, 128, 0',
        'blue-200': '191, 219, 254',
        'green-200': '187, 247, 208'
      };
      return colorMap[colorClass] || '200, 200, 200';
    };
  
    const processPosition = (pos) => {
      // Get all errors that overlap at this position
      currentOverlaps = errorPositions.filter(error => 
        error.start <= pos && error.end > pos
      );
  
      if (currentOverlaps.length === 0) {
        return text.charAt(pos);
      }
  
      // If this is the start of a new overlap region or a single error
      if (pos === currentOverlaps[0].start) {
        const endPos = Math.min(...currentOverlaps.map(e => e.end));
        const segment = text.slice(pos, endPos);
        
        if (currentOverlaps.length === 1) {
          // Single error
          return `<span class="${currentOverlaps[0].color} rounded px-1" title="${currentOverlaps[0].message}">${segment}</span>`;
        } else {
          // Multiple overlapping errors
          const messages = currentOverlaps.map(e => e.message).join('\n');
          const colors = currentOverlaps.map(e => e.color.replace('bg-', ''));
          
          return `<span class="rounded px-1 error-overlap-${currentOverlaps.length}" 
            style="--color1: rgb(${getColorValues(colors[0])}); 
                   --color2: rgb(${getColorValues(colors[1])}); 
                   ${colors[2] ? `--color3: rgb(${getColorValues(colors[2])});` : ''}"
            title="${messages}">${segment}</span>`;
        }
      }
      return '';
    };
  
    // Build the result string
    for (let i = 0; i < text.length; i++) {
      let processed = processPosition(i);
      if (processed) {
        result += processed;
        // Skip ahead if we just processed a span
        if (processed.includes('span')) {
          i = Math.min(...currentOverlaps.map(e => e.end)) - 1;
        }
      }
    }
  
    return result;
  };

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
      setHighlightedContent(createHighlightedText(essayContent, categorizedErrors));
      setLastCheckTime(now);
      setShowErrors(true);
  
      // Set active category to the first one that has errors
      const firstCategoryWithErrors = ERROR_CATEGORIES.find(
        category => categorizedErrors[category]?.length > 0
      );
      if (firstCategoryWithErrors) {
        setActiveErrorCategory(firstCategoryWithErrors);
      }
  
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
          <div className={`grid ${showErrors ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
            <div className="bg-white rounded-lg shadow p-4 h-[600px]">
              <div className="relative h-full">
                {/* Text area/highlighted content */}
                {showErrors ? (
                  <div
                    className="h-[calc(100%-80px)] overflow-y-auto whitespace-pre-wrap font-mono"
                    dangerouslySetInnerHTML={{ __html: highlightedContent || essayContent }}
                  />
                ) : (
                  <textarea
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                    className="w-full h-[calc(100%-80px)] resize-none focus:outline-none font-mono"
                    placeholder={`Start writing your ${section?.title} here...`}
                  />
                )}

                {/* Error toggle and map at the bottom */}
                {Object.keys(errors).length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-[80px] border-t border-gray-200">
                    <div className="flex justify-between items-center p-2">
                      <button
                        onClick={() => setShowErrors(!showErrors)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {showErrors ? (
                          <>
                            <EyeOffIcon className="h-5 w-5 text-gray-600" />
                            <span>Hide Errors</span>
                          </>
                        ) : (
                          <>
                            <EyeIcon className="h-5 w-5 text-gray-600" />
                            <span>Show Errors</span>
                          </>
                        )}
                      </button>
                      
                      {showErrors && (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(ERROR_COLORS)
                            .filter(([category]) => errors[category]?.length > 0)
                            .map(([category, colorClass]) => (
                              <div key={category} className="flex items-center space-x-1">
                                <span className={`inline-block w-3 h-3 rounded ${colorClass}`}></span>
                                <span className="text-xs text-gray-600">{getCategoryDisplayName(category)}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error panel on the right */}
            {showErrors && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {ERROR_CATEGORIES
                      .filter(category => errors[category]?.length > 0)
                      .map(category => (
                        <button
                          key={category}
                          onClick={() => setActiveErrorCategory(category)}
                          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                            activeErrorCategory === category
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {getCategoryDisplayName(category)} ({errors[category]?.length})
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