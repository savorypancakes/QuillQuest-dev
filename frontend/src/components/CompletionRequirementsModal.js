import React from 'react';

export const CompletionRequirementsModal = ({ isOpen, onClose, requirements, sectionTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Complete {sectionTitle}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-auto">
          <div className="space-y-4">
            <p className="text-gray-700">
              Please address the following before completing this section:
            </p>
            
            <div className="space-y-4">
              {/* Missing Requirements */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">Missing Requirements:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {requirements.missing.map((item, index) => (
                    <li key={index} className="text-red-700">{item}</li>
                  ))}
                </ul>
              </div>
              
              {/* Suggestions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Suggested Improvements:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {requirements.improvements.map((item, index) => (
                    <li key={index} className="text-blue-700">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Continue Writing
          </button>
        </div>
      </div>
    </div>
  );
};