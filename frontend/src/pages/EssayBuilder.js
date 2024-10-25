import React, { useState, useEffect } from 'react';
import { PlusIcon, XIcon } from '@heroicons/react/solid';
import { useNavigate, useLocation } from 'react-router-dom';

const ProgressCircle = ({ percentage }) => (
  <div className="relative w-8 h-8">
    <svg className="w-full h-full" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-purple-200" strokeWidth="2"></circle>
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        className="stroke-current text-purple-600"
        strokeWidth="2"
        strokeDasharray="100"
        strokeDashoffset={100 - percentage}
        transform="rotate(-90 18 18)"
      ></circle>
    </svg>
    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-purple-600">
      {percentage}%
    </div>
  </div>
);

const EssaySection = ({ title, percentage, isLast, onClick, onDelete, showDelete }) => (
  <div className="relative">
    <div className="flex items-center mb-4">
      <button
        onClick={onClick}
        className="flex-grow flex items-center justify-between bg-purple-600 text-white rounded-full py-2 px-4 z-10 relative hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
      >
        <span>{title}</span>
        <ProgressCircle percentage={percentage} />
      </button>
      {showDelete && (
        <button
          onClick={onDelete}
          className="ml-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          aria-label="Delete paragraph"
        >
          <XIcon className="h-5 w-5" />
        </button>
      )}
    </div>
    {!isLast && (
      <div className="absolute left-1/2 top-full w-0.5 h-4 bg-purple-600 -translate-x-1/2"></div>
    )}
  </div>
);

export default function EssayBuilder() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sections, setSections] = useState(() => {
    const savedSections = localStorage.getItem('essaySections');
    if (savedSections) {
      return JSON.parse(savedSections);
    }
    return [
      { id: 'intro', title: 'Introduction', percentage: 0 },
      { id: 'conclusion', title: 'Conclusion', percentage: 0 },
    ];
  });

  const [essayInfo, setEssayInfo] = useState(() => {
    const savedEssayInfo = localStorage.getItem('essayInfo');
    if (savedEssayInfo) {
      return JSON.parse(savedEssayInfo);
    }
    return location.state?.essayInfo || { prompt: '', title: '', postType: '' };
  });

  useEffect(() => {
    localStorage.setItem('essaySections', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('essayInfo', JSON.stringify(essayInfo));
  }, [essayInfo]);

  useEffect(() => {
    if (location.state?.updatedSections) {
      setSections(location.state.updatedSections);
    }
    if (location.state?.essayInfo) {
      setEssayInfo(location.state.essayInfo);
    }
    window.history.replaceState({}, document.title);
  }, [location.state]);

  const addSection = () => {
    const newSection = { 
      id: `body-${Date.now()}`, 
      title: `Body Paragraph ${sections.length - 1}`, 
      percentage: 0 
    };
    setSections([...sections.slice(0, -1), newSection, sections[sections.length - 1]]);
  };

  const deleteSection = (index) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  const handleSectionClick = (index) => {
    navigate(`/essayblock/${sections[index].id}`, { 
      state: { 
        section: sections[index], 
        allSections: sections,
        sectionIndex: index,
        essayInfo
      } 
    });
  };

  const handleCancel = () => {
    // Reset all progress
    localStorage.removeItem('essaySections');
    localStorage.removeItem('essayInfo');
    
    // Clear ALL section-related localStorage items
    sections.forEach(section => {
      // Clear content
      localStorage.removeItem(`essayContent_${section.id}`);
      // Clear requirements
      localStorage.removeItem(`sectionRequirements_${section.id}`);
      // Clear analysis
      localStorage.removeItem(`sectionAnalysis_${section.id}`);
    });
  
    // Clear any other potential essay-related items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('essay') || 
        key.startsWith('section') || 
        key.includes('Requirements') ||
        key.includes('Analysis')
      )) {
        localStorage.removeItem(key);
      }
    }
  
    // Navigate back to EssayGuidance
    navigate('/essayguidance');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-600 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-purple-600 mb-6">Essay Builder</h1>
        
        {/* Display essay info */}
        <div className="mb-4 text-sm bg-gray-100 p-3 rounded-md">
          <p><strong>Prompt:</strong> {essayInfo.prompt}</p>
          <p><strong>Title:</strong> {essayInfo.title}</p>
          <p><strong>Post Type:</strong> {essayInfo.postType}</p>
        </div>

        <div className="space-y-4">
          <EssaySection 
            title={sections[0].title} 
            percentage={sections[0].percentage} 
            isLast={false}
            onClick={() => handleSectionClick(0)}
            showDelete={false}
          />
          {sections.slice(1, -1).map((section, index) => (
            <EssaySection 
              key={section.id}
              title={section.title} 
              percentage={section.percentage} 
              isLast={false}
              onClick={() => handleSectionClick(index + 1)}
              onDelete={() => deleteSection(index + 1)}
              showDelete={true}
            />
          ))}
          {sections.length < 7 && (
            <div className="relative">
              <button
                onClick={addSection}
                className="w-full bg-white text-purple-600 border-2 border-purple-600 rounded-full py-2 px-4 font-medium hover:bg-purple-100 transition-colors mb-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                aria-label="Add new body paragraph"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Body Paragraph
              </button>
              <div className="absolute left-1/2 top-full w-0.5 h-4 bg-purple-600 -translate-x-1/2"></div>
            </div>
          )}
          <EssaySection 
            title={sections[sections.length - 1].title} 
            percentage={sections[sections.length - 1].percentage} 
            isLast={true}
            onClick={() => handleSectionClick(sections.length - 1)}
            showDelete={false}
          />
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={handleCancel}
            className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Cancel
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}