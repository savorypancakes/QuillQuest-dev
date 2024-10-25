export const CompletionRequirementsModal = ({ 
  isOpen, 
  onClose, 
  requirements, 
  sectionTitle,
  isRevision = false,
  hasBodyParagraphs = false,
  onDeleteSection,
  onAcceptChanges,
  onAddBodyParagraph,
  onCompleteEssay,
  meetsRequirements = false
}) => {
  if (!isOpen || !requirements) return null;

  const isIntroduction = sectionTitle?.toLowerCase().includes('introduction');
  const isBodyParagraph = sectionTitle?.toLowerCase().includes('body paragraph');
  const isConclusion = sectionTitle?.toLowerCase().includes('conclusion');

  const renderButtons = () => {
    const buttons = [];

    // Common "Continue Writing" button for all scenarios
    buttons.push(
      <button
        key="continue-writing"
        onClick={onClose}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Continue Writing
      </button>
    );

    if (isRevision) {
      // Revision scenarios
      buttons.push(
        <button
          key="accept-changes"
          onClick={onAcceptChanges}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Accept Changes
        </button>
      );

      if (!hasBodyParagraphs && (isIntroduction || isBodyParagraph)) {
        buttons.push(
          <button
            key="add-body"
            onClick={onAddBodyParagraph}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Add Body Paragraph
          </button>
        );
      }
    } else {
      // Initial writing scenarios
      if (isIntroduction) {
        if (meetsRequirements) {
          buttons.push(
            <button
              key="generate-body"
              onClick={requirements.onAddBodyParagraph}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Generate Body Paragraphs
            </button>
          );
        } else {
          buttons.push(
            <button
              key="add-body"
              onClick={requirements.onAddBodyParagraph}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Add Body Paragraph
            </button>
          );
        }
      } else if (isBodyParagraph) {
        // For body paragraphs (both complete and incomplete)
        buttons.push(
          <button
            key="next-section"
            onClick={requirements.onContinue}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Next Body Paragraph
          </button>
        );
        
        buttons.push(
          <button
            key="add-body"
            onClick={requirements.onAddNewBodyParagraph}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add New Body Paragraph
          </button>
        );
      
        buttons.push(
          <button
            key="move-conclusion"
            onClick={requirements.onMoveToConclusion}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Move to Conclusion
          </button>
        );
      } else if (isConclusion) {
        if (meetsRequirements) {
          buttons.push(
            <button
              key="complete-essay"
              onClick={onCompleteEssay}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Complete Essay
            </button>
          );
        } else {
          buttons.push(
            <button
              key="complete-essay"
              onClick={requirements.onCompleteEssay}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Complete Essay
            </button>
          );
        }
      }
    }

    return buttons;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {isRevision ? `Revise ${sectionTitle}` : `Complete ${sectionTitle}`}
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            {isRevision 
              ? "Review your changes to this section:"
              : requirements.isComplete 
                ? "Section requirements have been met:"
                : "This section has missing requirements:"}
          </p>
          
          <div className={`$'bg-blue-50' p-4 rounded-lg`}>
            <h3 className={`font-medium ${requirements.isComplete ? 'text-green-800' : 'text-red-800'} mb-2`}>
              "Requirements Overview:"
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              {requirements.missing && requirements.missing.map((item, index) => (
                <li key={index} className={requirements.isComplete ? 'text-green-700' : 'text-red-700'}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          {requirements.improvements?.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Suggested Improvements:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {requirements.improvements.map((item, index) => (
                  <li key={index} className="text-blue-700">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          {renderButtons()}
        </div>
      </div>
    </div>
  );
};