import React, { useState } from "react";
import TextEditor from '../components/TextEditor';
import '../assets/css/index.css'; // Ensure you have Tailwind's CSS imported

const CreatePost = () => {
  const [title, setTitle] = useState(''); // State for title input
  const [editorContent, setEditorContent] = useState(''); // State for text editor content

  const handleOutlineInsertion = async () => {
    try {
      const response = await fetch('YOUR_LLM_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: title }), // Use the title as prompt
      });
      const data = await response.json();
      // Append the LLM output to the current editor content
      setEditorContent((prevContent) => `${prevContent}\n${data.output}`); // Adjust according to your API response structure
    } catch (error) {
      console.error('Error fetching outline:', error);
    }
  };

  return (
    <div className="flex w-full h-screen">
      {/* Other components */}
      <div className="flex flex-col w-full">
        {/* Header Div */}
        <div className="flex items-center h-12 p-2 bg-gray-300 text-center border-b border-gray-400">
          <div className="w-1/12">
            <button 
              type="button" 
              className="w-auto px-4 py-1 text-sm bg-purple-600 bg-opacity-100 text-white hover:bg-opacity-80"
            >
              Primary
            </button>
          </div>
          <div className="w-9/12 flex flex-col flex-grow text-left ml-4 mt-6">
            <input
              type="text"
              value={title} // Bind the title input to state
              onChange={(e) => setTitle(e.target.value)} // Update title state on change
              className="w-full border-0 shadow-none bg-white placeholder-gray-700 font-bold py-1 px-3 focus:outline-none focus:bg-gray-100 hover:bg-gray-100"
              id="title"
              placeholder="Untitled document"
            />
          </div>
          <div className="w-2/12">
            <button type="button" className="w-auto px-4 py-1 text-sm bg-purple-600 bg-opacity-100 text-white hover:bg-opacity-80">
              Writing Assistant
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex w-full flex-grow overflow-y-auto">
          <div className="flex-grow p-4">
            <TextEditor content={editorContent} /> {/* Pass the editorContent as prop */}
          </div>
        </div>

        {/* Footer Div */}
        <div className="p-2 bg-gray-200 text-center border-t border-gray-300">
          <div className='flex mt-auto'>
            <div className="w-6/12 inline-flex border-4 border-black-600 rounded-md" role="group">
              <button type="button" className="text-sm font-medium bg-purple-600 text-white border-4 border-black">
                Select Post Type
              </button>
              <button type="button" className="text-sm font-medium bg-white text-purple-600 border-4 hover:bg-purple-400 hover:text-white">
                Discussion
              </button>
              <button type="button" className="text-sm font-medium bg-white text-purple-600 border-4 border-purple-600 rounded-md hover:bg-purple-400 hover:text-white">
                Advice and Feedback
              </button>
            </div>
            <div className='flex-grow text-right'> 
              <button id="dropdownHoverButton" data-dropdown-toggle="dropdownHover" data-dropdown-trigger="hover" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" type="button">Dropdown hover
                <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                </svg>
              </button>

              {/* Dropdown menu */}
              <div id="dropdownHover" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
                  <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdownHoverButton">
                    <li>
                      <a href="#" className="block px-4 py-2 hover:bg-gray-100">Dashboard</a>
                    </li>
                    <li>
                      <a href="#" className="block px-4 py-2 hover:bg-gray-100">Settings</a>
                    </li>
                    <li>
                      <a href="#" className="block px-4 py-2 hover:bg-gray-100">Earnings</a>
                    </li>
                    <li>
                      <a href="#" className="block px-4 py-2 hover:bg-gray-100">Sign out</a>
                    </li>
                  </ul>
              </div>
            </div>
            <div className='flex-grow text-right'> 
              <button 
                type="button" 
                className="w-auto px-4 py-1 text-sm mr-4 bg-purple-600 bg-opacity-100 text-white hover:bg-opacity-80 transition"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Div */}
      <div className="w-2/12 border-l border-gray-400 p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <p>Outline Insertion</p>
            <button 
              type="button" 
              className="btn hover:bg-purple-400 w-auto text-sm px-2 py-1"
              onClick={handleOutlineInsertion} // Call the handler on button click
            >
              Insert
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p>Argument Suggestion</p>
            <button 
              type="button" 
              className="btn hover:bg-purple-400 w-auto text-sm px-2 py-1">
              Suggest
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p>Next Sentence Suggestion</p>
            <button 
              type="button" 
              className="btn hover:bg-purple-400 w-auto text-sm px-2 py-1">
              Suggest
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p>Error Correction</p>
            <button 
              type="button" 
              className="btn hover:bg-purple-400 w-auto text-sm px-2 py-1">
              Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
