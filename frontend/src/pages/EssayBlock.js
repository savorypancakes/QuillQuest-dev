import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatAlt2Icon, 
  CheckCircleIcon, 
  EyeIcon, 
  EyeOffIcon,
  PlusIcon 
} from '@heroicons/react/solid';
import WritingAssistant from '../components/WritingAssistant';
import { checkEssayErrors } from '../utils/essayChecker';
import { checkSectionCompleteness, parseThesisPoints, generateBodySections } from '../utils/checkSectionCompleteness';
import CompletionButton from '../components/CompletionButton';
import EssayPreviewModal from '../components/EssayPreviewModal';
import SectionPreview from '../components/SectionPreview';
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


const SidebarItem = ({ title, progress, isActive, isLast, id, onSelect, onDelete }) => {
  const hasSavedContent = localStorage.getItem(`essayContent_${id}`)?.trim();
  const requirements = JSON.parse(localStorage.getItem(`sectionRequirements_${id}`) || 'null');
  const isBodyParagraph = title.toLowerCase().includes('body paragraph');
  
  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-3 py-2">
        <div 
          className="relative cursor-pointer group"
          onClick={onSelect}
        >
          <div className={`w-6 h-6 rounded-full 
            ${isActive ? 'bg-purple-600' : 
              hasSavedContent ? 'bg-purple-400' : 
              'bg-purple-200'} 
            flex items-center justify-center transition-colors
            hover:bg-purple-500`}
          >
            <div className={`w-4 h-4 rounded-full 
              ${isActive ? 'bg-white' : 'bg-purple-600'}`} 
              style={{ opacity: hasSavedContent || progress ? 1 : 0.3 }}
            />
          </div>
          {!isLast && (
            <div className="absolute top-6 left-3 w-0.5 h-full bg-purple-200" />
          )}
        </div>

        

        <div className="flex-1 flex items-center justify-between">
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
          {isBodyParagraph && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this body paragraph?')) {
                  onDelete(id);
                }
              }}
              className="p-1 text-red-500 hover:text-red-700 ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        
      </div>
      
      {/* Requirements display */}
      {requirements && !progress && (
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

      {/* Only show preview for non-body paragraphs */}
      {hasSavedContent && !isActive && !isBodyParagraph && (
        <div className="ml-9 mt-1">
          <SectionPreview 
            sectionId={id}
            title={title}
          />
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
  const [isCompleting, setIsCompleting] = useState(false);
  const [isRevision] = useState(false);
  const [hasExistingBodyParagraphs, setHasExistingBodyParagraphs] = useState(false);
  

  // Remove the duplicate useEffect and keep this single one
  useEffect(() => {
    // Only load content for the current section if we haven't loaded it yet
    const loadSectionContent = () => {
      const savedContent = localStorage.getItem(`essayContent_${sectionId}`);
      if (savedContent) {
        setEssayContent(savedContent);
      } else {
        // Only reset to empty if there's no saved content
        setEssayContent('');
      }
    };

    // Reset UI states but preserve content
    setHighlightedContent('');
    setErrors({});
    setShowErrors(false);
    setHasChecked(false);
    setScore(0);
    
    loadSectionContent();
  }, [sectionId]);

  useEffect(() => {
    if (showErrors && Object.keys(errors).length > 0) {
      const highlighted = createHighlightedText(essayContent, errors);
      setHighlightedContent(highlighted);
    }
  }, [errors, essayContent, showErrors]);

  useEffect(() => {
    if (allSections) {
      const bodyParagraphs = allSections.filter(s => 
        s.title.toLowerCase().includes('body paragraph')
      );
      setHasExistingBodyParagraphs(bodyParagraphs.length > 0);
    }
  }, [allSections]);

  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (sectionId) {
        // Save even if content is empty - this is the key change
        localStorage.setItem(`essayContent_${sectionId}`, essayContent);
      }
    }, 3000); // Auto-save every 3 seconds

    return () => clearInterval(autoSaveTimer);
  }, [essayContent, sectionId]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setEssayContent(newContent);
    // Immediately save the content, even if empty
    localStorage.setItem(`essayContent_${sectionId}`, newContent);
  };

  const handleDeleteBodyParagraph = (paragraphId) => {
    // Filter out the deleted section
    const updatedSections = allSections.filter(s => s.id !== paragraphId);
    
    // Renumber remaining body paragraphs
    const finalSections = updatedSections.map(s => {
      if (s.title.toLowerCase().includes('body paragraph')) {
        const bodyParagraphs = updatedSections.filter(sec => 
          sec.title.toLowerCase().includes('body paragraph')
        );
        const index = bodyParagraphs.findIndex(bp => bp.id === s.id) + 1;
        return {
          ...s,
          title: `Body Paragraph ${index}`
        };
      }
      return s;
    });
  
    // Remove the content and requirements from localStorage
    localStorage.removeItem(`essayContent_${paragraphId}`);
    localStorage.removeItem(`sectionRequirements_${paragraphId}`);
  
    // If the deleted section was the current section, navigate to another section
    if (paragraphId === sectionId) {
      const currentIndex = allSections.findIndex(s => s.id === sectionId);
      const nextSection = finalSections[Math.min(currentIndex, finalSections.length - 1)];
      
      navigate(`/essayblock/${nextSection.id}`, {
        state: {
          section: nextSection,
          allSections: finalSections,
          essayInfo
        }
      });
    } else {
      // Just update the state
      if (location.state) {
        location.state.allSections = finalSections;
      }
      navigate(`/essayblock/${sectionId}`, {
        state: {
          section,
          allSections: finalSections,
          essayInfo
        }
      });
    }
  };  

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
  // Replace your current handleSectionSelect function with this simplified version
  const handleSectionSelect = (selectedSection) => {
    // Save current section's content before navigating, even if empty
    localStorage.setItem(`essayContent_${sectionId}`, essayContent);

    navigate(`/essayblock/${selectedSection.id}`, {
      state: {
        section: selectedSection,
        allSections,
        essayInfo
      }
    });
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


// Update the handleComplete function
const handleComplete = async () => {
  if (!essayContent.trim()) {
    alert('Please write some content before completing this section.');
    return;
  }

  // Save current content before proceeding
  localStorage.setItem(`essayContent_${sectionId}`, essayContent);
  
  setIsCompleting(true);
  try {
    const currentSectionIndex = allSections.findIndex(s => s.id === sectionId);
    const nextSectionIndex = currentSectionIndex + 1;
    const prevSectionId = currentSectionIndex > 0 ? allSections[currentSectionIndex - 1].id : null;
    const previousContent = prevSectionId ? localStorage.getItem(`essayContent_${prevSectionId}`) : null;
    const hasPreviousContent = localStorage.getItem(`essayContent_${sectionId}`)?.trim();

    const completenessAnalysis = await checkSectionCompleteness(
      essayContent, 
      section?.title,
      previousContent
    );

    const isIntroduction = section?.title.toLowerCase().includes('introduction');
    const isBodyParagraph = section?.title.toLowerCase().includes('body paragraph');
    const isConclusion = section?.title.toLowerCase().includes('conclusion');
    const isRevisionAttempt = hasPreviousContent && isRevision;

    // Initialize updatedSections at the beginning
    let updatedSections = allSections.map(s => 
      s.id === sectionId ? { ...s, percentage: 50 } : s
    );

    // Handle incomplete sections
    if (!completenessAnalysis.isComplete) {
      if (isIntroduction) {
        // Save requirements first
        localStorage.setItem(`sectionRequirements_${sectionId}`, JSON.stringify({
          missing: completenessAnalysis.completionStatus.missing,
          improvements: completenessAnalysis.suggestedImprovements
        }));
      
        updatedSections = allSections.map(s => 
          s.id === sectionId ? { ...s, percentage: 50 } : s
        );
      
        setCompletionRequirements({
          missing: completenessAnalysis.completionStatus.missing,
          improvements: completenessAnalysis.suggestedImprovements,
          isRevision: isRevisionAttempt,
          hasBodyParagraphs: hasExistingBodyParagraphs,
          isComplete: false,
          onAddBodyParagraph: () => {
            // Find conclusion section index if it exists
            const conclusionIndex = allSections.findIndex(s => 
              s.title.toLowerCase().includes('conclusion')
            );
          
            // Get only body paragraphs and sort them by number
            const bodyParagraphs = allSections
              .filter(s => s.title.toLowerCase().includes('body paragraph'))
              .sort((a, b) => {
                const numA = parseInt(a.title.match(/\d+/)[0]);
                const numB = parseInt(b.title.match(/\d+/)[0]);
                return numA - numB;
              });
          
            const newBodySection = {
              id: `body-${Date.now()}`,
              title: `Body Paragraph ${bodyParagraphs.length + 1}`,
              type: 'body',
              percentage: 0
            };
          
            // Insert before conclusion or at the end if no conclusion
            let updatedSections;
            if (conclusionIndex !== -1) {
              updatedSections = [
                ...allSections.slice(0, conclusionIndex),
                newBodySection,
                ...allSections.slice(conclusionIndex)
              ];
            } else {
              updatedSections = [...allSections, newBodySection];
            }
          
            setShowRequirementsModal(false);
            navigate(`/essayblock/${newBodySection.id}`, {
              state: {
                section: newBodySection,
                allSections: updatedSections,
                essayInfo
              }
            });
          },
          onAcceptChanges: isRevisionAttempt ? () => {
            const updatedSections = allSections.map(s => 
              s.id === sectionId ? { ...s, percentage: 50 } : s
            );
            
            localStorage.setItem(`essayContent_${sectionId}`, essayContent);
            localStorage.setItem(`sectionRequirements_${sectionId}`, JSON.stringify({
              missing: completenessAnalysis.completionStatus.missing,
              improvements: completenessAnalysis.suggestedImprovements
            }));

            setShowRequirementsModal(false);
            if (nextSectionIndex < updatedSections.length) {
              navigate(`/essayblock/${updatedSections[nextSectionIndex].id}`, {
                state: {
                  section: updatedSections[nextSectionIndex],
                  allSections: updatedSections,
                  essayInfo
                }
              });
            }
          } : undefined
        });
      // Update the body paragraph complete section handling:
      } else if (isBodyParagraph) {
        // Initialize updatedSections at the beginning of the body paragraph section
        const updatedSections = allSections.map(s => 
          s.id === sectionId ? { ...s, percentage: 50 } : s
        );
      
        // Save requirements for body paragraph
        localStorage.setItem(`sectionRequirements_${sectionId}`, JSON.stringify({
          missing: completenessAnalysis.completionStatus.missing,
          improvements: completenessAnalysis.suggestedImprovements
        }));
        
        setCompletionRequirements({
          missing: completenessAnalysis.completionStatus.missing,
          improvements: completenessAnalysis.suggestedImprovements,
          isComplete: false,
          isRevision: isRevisionAttempt,
          hasBodyParagraphs: hasExistingBodyParagraphs,
          onContinue: () => {
            if (nextSectionIndex < updatedSections.length) {
              const nextSection = updatedSections[nextSectionIndex];
              setShowRequirementsModal(false);
              navigate(`/essayblock/${nextSection.id}`, {
                state: {
                  section: nextSection,
                  allSections: updatedSections,
                  essayInfo
                }
              });
            }
          },
          onMoveToConclusion: () => {
            const conclusionSection = allSections.find(s => 
              s.title.toLowerCase().includes('conclusion')
            ) || {
              id: `conclusion-${Date.now()}`,
              title: 'Conclusion',
              type: 'conclusion',
              percentage: 0
            };
            
            // Keep percentage at 50 to maintain requirements display
            let updatedSections = allSections.map(s => 
              s.id === sectionId ? { ...s, percentage: 50 } : s
            );
          
            if (!allSections.find(s => s.title.toLowerCase().includes('conclusion'))) {
              updatedSections.push(conclusionSection);
            }
          
            // Save current requirements and content
            localStorage.setItem(`essayContent_${sectionId}`, essayContent);
            localStorage.setItem(`sectionRequirements_${sectionId}`, JSON.stringify({
              missing: completenessAnalysis.completionStatus.missing,
              improvements: completenessAnalysis.suggestedImprovements
            }));
          
            setShowRequirementsModal(false);
            navigate(`/essayblock/${conclusionSection.id}`, {
              state: {
                section: conclusionSection,
                allSections: updatedSections,
                essayInfo
              }
            });
          },
          onAddNewBodyParagraph: () => {
            // Find conclusion section index if it exists
            const conclusionIndex = allSections.findIndex(s => 
              s.title.toLowerCase().includes('conclusion')
            );
          
            // Count existing body paragraphs for proper numbering
            const bodyParagraphCount = allSections.filter(s => 
              s.title.toLowerCase().includes('body paragraph')
            ).length;
          
            const newBodySection = {
              id: `body-${Date.now()}`,
              title: `Body Paragraph ${bodyParagraphCount + 1}`,
              type: 'body',
              percentage: 0
            };
          
            // Insert new body paragraph before conclusion or at the end if no conclusion
            const updatedSections = [...allSections];
            if (conclusionIndex !== -1) {
              updatedSections.splice(conclusionIndex, 0, newBodySection);
            } else {
              updatedSections.push(newBodySection);
            }
          
            setShowRequirementsModal(false);
            navigate(`/essayblock/${newBodySection.id}`, {
              state: {
                section: newBodySection,
                allSections: updatedSections,
                essayInfo
              }
            });
          }
        });
        setShowRequirementsModal(true);
        setIsCompleting(false);
      } else if (isConclusion) {
        setCompletionRequirements({
          missing: completenessAnalysis.completionStatus.missing,
          improvements: completenessAnalysis.suggestedImprovements,
          isComplete: completenessAnalysis.isComplete,
          isRevision: isRevisionAttempt,
          onCompleteEssay: () => {
            setShowRequirementsModal(false);
            // Navigate back to essay builder instead of review
            navigate('/essaybuilder', {
              state: {
                allSections: updatedSections,
                essayInfo
              }
            });
          }
        });
      
        // Save requirements if incomplete
        if (!completenessAnalysis.isComplete) {
          localStorage.setItem(`sectionRequirements_${sectionId}`, JSON.stringify({
            missing: completenessAnalysis.completionStatus.missing,
            improvements: completenessAnalysis.suggestedImprovements
          }));
        }
      }
      setShowRequirementsModal(true);
      setIsCompleting(false);
      return;
    }

    // Handle complete sections
    localStorage.setItem(`essayContent_${sectionId}`, essayContent);
    localStorage.removeItem(`sectionRequirements_${sectionId}`);

    updatedSections = allSections.map(s => 
      s.id === sectionId ? { ...s, percentage: 100 } : s
    );

    // Handle complete sections based on type
    if (isIntroduction && !isRevisionAttempt) {
      try {
        const thesisPoints = await parseThesisPoints(essayContent);
        const generatedSections = await generateBodySections(thesisPoints.mainPoints);
        
        const sectionsWithBody = [
          ...updatedSections.slice(0, nextSectionIndex),
          ...generatedSections,
          ...updatedSections.slice(nextSectionIndex)
        ];

        navigate(`/essayblock/${generatedSections[0].id}`, {
          state: {
            section: generatedSections[0],
            allSections: sectionsWithBody,
            essayInfo
          }
        });
      } catch (error) {
        console.error('Error generating body sections:', error);
        alert('Error generating body sections from thesis. Please review your thesis statement and try again.');
        setIsCompleting(false);
        return;
      }
    } else if (isBodyParagraph) {
      // Save requirements regardless of completion status
      localStorage.setItem(`sectionRequirements_${sectionId}`, JSON.stringify({
        missing: completenessAnalysis.completionStatus.missing,
        improvements: completenessAnalysis.suggestedImprovements
      }));
    
      const updatedSections = allSections.map(s => 
        s.id === sectionId ? { ...s, percentage: 50 } : s
      );
    
      setCompletionRequirements({
        missing: completenessAnalysis.completionStatus.missing,
        improvements: completenessAnalysis.suggestedImprovements,
        isComplete: false,  // We're in the incomplete section
        isRevision: isRevisionAttempt,
        hasBodyParagraphs: hasExistingBodyParagraphs,
        onContinue: () => {
          if (nextSectionIndex < updatedSections.length) {
            const nextSection = updatedSections[nextSectionIndex];
            setShowRequirementsModal(false);
            navigate(`/essayblock/${nextSection.id}`, {
              state: {
                section: nextSection,
                allSections: updatedSections,
                essayInfo
              }
            });
          }
        },
        onMoveToConclusion: () => {
          const conclusionSection = allSections.find(s => 
            s.title.toLowerCase().includes('conclusion')
          ) || {
            id: `conclusion-${Date.now()}`,
            title: 'Conclusion',
            type: 'conclusion',
            percentage: 0
          };
        
          // // Keep percentage at 50 to maintain requirements display
          let updatedSections = allSections.map(s => 
            s.id === sectionId ? { ...s, percentage: 50 } : s
          );
        
          if (!allSections.find(s => s.title.toLowerCase().includes('conclusion'))) {
            updatedSections.push(conclusionSection);
          }
        
          // Save current requirements
          localStorage.setItem(`sectionRequirements_${sectionId}`, JSON.stringify({
            missing: completenessAnalysis.completionStatus.missing,
            improvements: completenessAnalysis.suggestedImprovements
          }));
        
          setShowRequirementsModal(false);
          navigate(`/essayblock/${conclusionSection.id}`, {
            state: {
              section: conclusionSection,
              allSections: updatedSections,
              essayInfo
            }
          });
        },
        onAddNewBodyParagraph: () => {
          // Find conclusion section index if it exists
          const conclusionIndex = allSections.findIndex(s => 
            s.title.toLowerCase().includes('conclusion')
          );
        
          // Count existing body paragraphs for proper numbering
          const bodyParagraphCount = allSections.filter(s => 
            s.title.toLowerCase().includes('body paragraph')
          ).length;
        
          const newBodySection = {
            id: `body-${Date.now()}`,
            title: `Body Paragraph ${bodyParagraphCount + 1}`,
            type: 'body',
            percentage: 0
          };
        
          const newUpdatedSections = [...updatedSections];
          if (conclusionIndex !== -1) {
            newUpdatedSections.splice(conclusionIndex, 0, newBodySection);
          } else {
            newUpdatedSections.push(newBodySection);
          }
        
          setShowRequirementsModal(false);
          navigate(`/essayblock/${newBodySection.id}`, {
            state: {
              section: newBodySection,
              allSections: newUpdatedSections,
              essayInfo
            }
          });
        }
      });
      setShowRequirementsModal(true);
      setIsCompleting(false);
    }
  } catch (error) {
    console.error('Error during completion:', error);
    alert('There was an error processing the section. Please try again.');
  } finally {
    setIsCompleting(false);
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
        {/* Update the sidebar section rendering */}
        <div className="p-4 flex-grow overflow-auto">
          <h3 className="font-semibold mb-2">Essay Progress</h3>
          {allSections?.map((s, index) => {
            const isIntroduction = s.title.toLowerCase().includes('introduction');
            const isConclusion = s.title.toLowerCase().includes('conclusion');
            const isBodyParagraph = s.title.toLowerCase().includes('body paragraph');
            
            return (
              <React.Fragment key={s.id}>
                <SidebarItem 
                  id={s.id}
                  title={s.title} 
                  progress={s.percentage === 100}
                  isActive={s.id === sectionId}
                  isLast={isBodyParagraph || isIntroduction} // Make body paragraphs and intro "last" to break line
                  onSelect={() => handleSectionSelect(s)}
                  onDelete={handleDeleteBodyParagraph}
                />
                {s.percentage === 100 && s.id !== sectionId && (
                  <div className="ml-9 mt-1">
                    <SectionPreview 
                      sectionId={s.id}
                      title={s.title}
                    />
                  </div>
                )}
                
                {/* Add Body Paragraph Button after Introduction or last Body Paragraph */}
                {/* Add Body Paragraph Button after Introduction or last Body Paragraph */}
                {(isIntroduction || isBodyParagraph) && index === allSections.findIndex(sec => sec.title.toLowerCase().includes('conclusion')) - 1 && 
                allSections.filter(sec => sec.title.toLowerCase().includes('body paragraph')).length < 5 && (
                  <div className="relative cursor-pointer group py-2">
                    <div className={`w-6 h-6 rounded-full bg-purple-200 
                      flex items-center justify-center transition-colors
                      hover:bg-purple-500 absolute left-3 top-1/2 transform -translate-y-1/2`}
                    >
                      <div className="w-4 h-4 rounded-full bg-purple-600" style={{ opacity: 0.3 }} />
                    </div>
                    <button
                      onClick={() => {
                        const conclusionIndex = allSections.findIndex(s => 
                          s.title.toLowerCase().includes('conclusion')
                        );
                        
                        const bodyParagraphCount = allSections.filter(s => 
                          s.title.toLowerCase().includes('body paragraph')
                        ).length;

                        const newBodySection = {
                          id: `body-${Date.now()}`,
                          title: `Body Paragraph ${bodyParagraphCount + 1}`,
                          type: 'body',
                          percentage: 0
                        };
                        
                        let updatedSections;
                        if (conclusionIndex !== -1) {
                          updatedSections = [
                            ...allSections.slice(0, conclusionIndex),
                            newBodySection,
                            ...allSections.slice(conclusionIndex)
                          ];
                        } else {
                          updatedSections = [...allSections, newBodySection];
                        }
                        
                        navigate(`/essayblock/${sectionId}`, {
                          state: {
                            section,
                            allSections: updatedSections,
                            essayInfo
                          }
                        });
                      }}
                      className="w-full flex-1 flex items-center space-x-3 bg-white text-purple-600 border-2 border-dashed border-purple-600 rounded-full py-1 pl-12 pr-4 hover:bg-purple-50 transition-colors ml-6 text-sm"
                    >
                      <span className="font-medium">Add Body Paragraph</span>
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </React.Fragment>
            );
          })}
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
                  onChange={handleContentChange}
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
            isCompleting={isCompleting} 
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