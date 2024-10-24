import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatAlt2Icon, 
  CheckCircleIcon, 
  EyeIcon, 
  EyeOffIcon 
} from '@heroicons/react/solid';
import WritingAssistant from '../components/WritingAssistant';
import { checkEssayErrors } from '../utils/essayChecker';
import { checkSectionCompleteness, parseThesisPoints, generateBodySections } from '../utils/checkSectionCompleteness';
import CompletionButton from '../components/CompletionButton';
import EssayPreviewModal from '../components/EssayPreviewModal';
import SectionPreview from '../components/SectionPreview';
import { SectionRequirements } from '../components/SectionRequirements';
import { CompletionRequirementsModal } from '../components/CompletionRequirementsModal';




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


// Replace the entire SidebarItem component with this version:
const SidebarItem = ({ title, progress, isActive, isLast, id, onSelect }) => {
  const hasSavedContent = localStorage.getItem(`essayContent_${id}`)?.trim();
  const requirements = JSON.parse(localStorage.getItem(`sectionRequirements_${id}`) || 'null');
  const isClickable = hasSavedContent || progress || isActive;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-3 py-2">
        <div 
          className={`relative ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} group`}
          onClick={onSelect}
        >
          <div className={`w-6 h-6 rounded-full 
            ${isActive ? 'bg-purple-600' : 
              hasSavedContent ? 'bg-purple-400' : 
              'bg-purple-200'} 
            flex items-center justify-center transition-colors
            ${isClickable ? 'hover:bg-purple-500' : ''}`}
          >
            <div className={`w-4 h-4 rounded-full 
              ${isActive ? 'bg-white' : 'bg-purple-600'}`} 
              style={{ opacity: hasSavedContent || progress ? 1 : 0.3 }}
            />
          </div>
          {!isLast && <div className="absolute top-6 left-3 w-0.5 h-full bg-purple-200" />}
          
          {!isClickable && (
            <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded 
              opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {hasSavedContent ? 'Continue writing' : 'Start this section'}
            </div>
          )}
        </div>

        <div className="flex-1">
          <span className={`text-gray-700 
            ${isActive ? 'font-bold' : ''} 
            ${hasSavedContent ? 'text-purple-600' : ''}`}
          >
            {title}
            {hasSavedContent && !progress && (
              <span className="ml-2 text-xs text-purple-400">
                (draft{requirements ? ' - incomplete' : ''})
              </span>
            )}
          </span>
        </div>
      </div>
      
      {/* Requirements display */}
      {requirements && (
        <div className="ml-9 text-xs bg-red-50 p-2 rounded-md">
          <div className="font-medium text-red-800 mb-1">Missing Requirements:</div>
          <ul className="list-disc pl-4 text-red-600 space-y-1">
            {requirements.missing.map((req, idx) => (
              <li key={idx} className="text-sm">{req}</li>
            ))}
          </ul>
          {requirements.improvements && requirements.improvements.length > 0 && (
            <>
              <div className="font-medium text-blue-800 mt-2 mb-1">Suggestions:</div>
              <ul className="list-disc pl-4 text-blue-600 space-y-1">
                {requirements.improvements.map((imp, idx) => (
                  <li key={idx} className="text-sm">{imp}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      

    </div>
  );
};

export default function EssayBlock() {
  const { sectionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { section, allSections, essayInfo } = location.state || {};
  const [highlightedContent, setHighlightedContent] = useState('');
  const [essayContent, setEssayContent] = useState('');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeErrorCategory, setActiveErrorCategory] = useState('spelling');
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [score, setScore] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [completionRequirements, setCompletionRequirements] = useState(null);
  

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

  // Add this function to your EssayBlock component
  // Replace your current handleSectionSelect function with this version
const handleSectionSelect = (selectedSection) => {
  // Check if there's saved content for the selected section
  const hasSavedContent = localStorage.getItem(`essayContent_${selectedSection.id}`)?.trim();
  
  // Allow navigation if:
  // 1. The section has any saved content, or
  // 2. It's the current section, or
  // 3. The section is already completed, or
  // 4. The previous section has content (to allow natural progression)
  const selectedIndex = allSections.findIndex(s => s.id === selectedSection.id);
  const previousSection = selectedIndex > 0 ? allSections[selectedIndex - 1] : null;
  const previousHasContent = previousSection 
    ? localStorage.getItem(`essayContent_${previousSection.id}`)?.trim()
    : true; // If it's the first section, allow access

  if (hasSavedContent || 
      selectedSection.id === sectionId || 
      selectedSection.percentage === 100 || 
      previousHasContent) {
    navigate(`/essayblock/${selectedSection.id}`, {
      state: {
        section: selectedSection,
        allSections,
        essayInfo
      }
    });
  }
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
      setHasChecked(true);

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

  // Update your handleComplete function
  const handleComplete = async () => {
    if (!essayContent.trim()) {
      alert('Please write some content before completing this section.');
      return;
    }
  
    setIsChecking(true);
    try {
      const currentSectionIndex = allSections.findIndex(s => s.id === sectionId);
      const prevSectionId = currentSectionIndex > 0 ? allSections[currentSectionIndex - 1].id : null;
      const previousContent = prevSectionId ? localStorage.getItem(`essayContent_${prevSectionId}`) : null;
  
      const completenessAnalysis = await checkSectionCompleteness(
        essayContent, 
        section?.title,
        previousContent
      );
  
      if (!completenessAnalysis.isComplete) {
        const requirements = {
          missing: completenessAnalysis.completionStatus.missing,
          improvements: completenessAnalysis.suggestedImprovements
        };
        
        localStorage.setItem(`sectionRequirements_${sectionId}`, JSON.stringify(requirements));
        setCompletionRequirements(requirements);
        setShowRequirementsModal(true);
        return;
      }
  
      // Clear requirements if section is complete
      localStorage.removeItem(`sectionRequirements_${sectionId}`);
      setCompletionRequirements(null);
  
      // Store the completed section content
      localStorage.setItem(`essayContent_${sectionId}`, essayContent);
      localStorage.setItem(`sectionAnalysis_${sectionId}`, JSON.stringify(completenessAnalysis));
  
      // Update sections with completion status
      const updatedSections = allSections.map(s => 
        s.id === sectionId ? { ...s, percentage: 100 } : s
      );
  
      // Handle introduction-specific logic for body generation
      if (section?.title.toLowerCase().includes('introduction')) {
        const thesisPoints = await parseThesisPoints(completenessAnalysis.thesisStatement);
        const newBodySections = generateBodySections(thesisPoints.mainPoints);
        
        const introIndex = currentSectionIndex;
        const conclusionIndex = allSections.findIndex(s => 
          s.title.toLowerCase().includes('conclusion')
        );
        
        const sectionsWithBody = [
          ...updatedSections.slice(0, introIndex + 1),
          ...newBodySections,
          ...(conclusionIndex >= 0 ? updatedSections.slice(conclusionIndex) : [])
        ];
  
        // Navigate to the first body section
        const nextSectionId = newBodySections[0].id;
        navigate(`/essayblock/${nextSectionId}`, {
          state: {
            section: newBodySections[0],
            allSections: sectionsWithBody,
            essayInfo: {
              ...essayInfo,
              thesisPoints: thesisPoints.mainPoints
            }
          }
        });
      } else {
        // For non-introduction sections, navigate to the next section if available
        const nextSectionIndex = currentSectionIndex + 1;
        if (nextSectionIndex < updatedSections.length) {
          const nextSection = updatedSections[nextSectionIndex];
          navigate(`/essayblock/${nextSection.id}`, {
            state: {
              section: nextSection,
              allSections: updatedSections,
              essayInfo
            }
          });
        } else {
          // If this was the last section, navigate back to essay builder
          navigate('/essaybuilder', {
            state: {
              updatedSections,
              essayInfo
            }
          });
        }
      }
    } catch (error) {
      console.error('Error during completion:', error);
      alert('There was an error processing the section. Please try again.');
    } finally {
      setIsChecking(false);
    }
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
        {/* // Update the sidebar section rendering */}
        <div className="p-4 flex-grow">
          <h3 className="font-semibold mb-2">Essay Progress</h3>
          {allSections?.map((s, index) => (
            <div key={s.id}>
              <SidebarItem 
                id={s.id}
                title={s.title} 
                progress={s.percentage === 100}
                isActive={s.id === sectionId}
                isLast={index === allSections.length - 1}
                onSelect={() => handleSectionSelect(s)}
              />
              {s.percentage === 100 && s.id !== sectionId && (
                <div className="ml-9 mt-1">
                  <SectionPreview 
                    sectionId={s.id}
                    title={s.title}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{section?.title}</h1>
          <div className="flex items-center space-x-4">
            <EssayPreviewModal 
              sections={allSections} 
              essayInfo={essayInfo}
            />
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

        {/* Main content area with fixed height */}
        <div className="flex-grow p-6 overflow-hidden h-[calc(100vh-8rem)]">
          <div className="h-full grid grid-cols-12 gap-6">
            {/* Text editor */}
            <div className={`${hasChecked && showErrors ? 'col-span-5' : 'col-span-12'} bg-white rounded-lg shadow overflow-hidden flex flex-col`}>
              <div className="h-[calc(100%-60px)] p-4 overflow-hidden">
                <textarea
                  value={essayContent}
                  onChange={(e) => setEssayContent(e.target.value)}
                  className="w-full h-full resize-none focus:outline-none font-mono overflow-auto"
                  placeholder={`Start writing your essay here...`}
                />
              </div>
              {hasChecked && (
                <div className="h-[60px] px-4 py-3 border-t border-gray-200 flex items-center">
                  <button
                    onClick={() => setShowErrors(!showErrors)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {showErrors ? (
                      <>
                        <EyeOffIcon className="h-5 w-5 text-gray-600" />
                        <span>Hide Corrections</span>
                      </>
                    ) : (
                      <>
                        <EyeIcon className="h-5 w-5 text-gray-600" />
                        <span>Show Corrections</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Highlighted content and error panel */}
            {hasChecked && showErrors && (
              <>
                {/* Highlighted content */}
                <div className="col-span-4 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                  <div className="h-[calc(100%-60px)] p-4 overflow-auto">
                    <div
                      className="whitespace-pre-wrap font-mono"
                      dangerouslySetInnerHTML={{ __html: highlightedContent }}
                    />
                  </div>
                  <div className="h-[60px] px-4 py-3 border-t border-gray-200 flex items-center">
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
                  </div>
                </div>

                {/* Error panel */}
                <div className="col-span-3 flex flex-col">
                  <div className="bg-white rounded-lg p-4 shadow mb-4">
                    <div className="flex space-x-2 overflow-x-auto">
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
                  <div className="flex-grow bg-white rounded-lg shadow overflow-auto">
                    <div className="p-4">
                      {renderErrorPanel()}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 h-16 flex items-center justify-end px-6">
          <button
            onClick={handleCheck}
            className="bg-blue-500 text-white px-6 py-2 rounded-full mr-4 flex items-center"
            disabled={isChecking}
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {isChecking ? 'Checking...' : 'Check'}
          </button>
          <CompletionButton 
            onClick={handleComplete} 
            isChecking={isChecking} 
          />
        </footer>
        {/* Add this near the bottom of your render, before the WritingAssistant */}
        <CompletionRequirementsModal 
          isOpen={showRequirementsModal}
          onClose={() => setShowRequirementsModal(false)}
          requirements={completionRequirements}
          sectionTitle={section?.title}
        />

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