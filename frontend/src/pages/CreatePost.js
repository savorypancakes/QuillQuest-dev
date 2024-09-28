import React, { useState } from "react";
import TextEditor from '../components/TextEditor';
import '../assets/css/index.css'; // Ensure you have Tailwind's CSS imported

const CreatePost = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="flex w-full h-screen">
      {/* Main content area */}
      <div className="flex flex-col w-full">
        {/* Header Div */}
        <div className="flex items-center h-12 p-2 bg-gray-300 text-center border-b border-gray-400">
          {/* Division 1: Return to post feed page */}
          <div className="w-1/12">
            <button
              type="button"
              className="w-auto px-4 py-1 text-sm bg-purple-600 bg-opacity-100 text-white hover:bg-opacity-80"
            >
              Primary
            </button>
          </div>

          {/* Division 2: Text editor + post type picker + post button */}
          <div className="w-9/12 flex flex-col flex-grow text-left ml-4 mt-6">
            <input
              type="text"
              className="w-full border-0 shadow-none bg-white placeholder-gray-700 font-bold py-1 px-3 focus:outline-none focus:bg-gray-100 hover:bg-gray-100"
              id="title"
              placeholder="Untitled document"
            />
          </div>

          {/* Division 3: Writing assistant + dashboard */}
          <div className="w-2/12">
            <button
              type="button"
              className="w-auto px-4 py-1 text-sm bg-purple-600 bg-opacity-100 text-white hover:bg-opacity-80"
            >
              Writing Assistant
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex w-full flex-grow overflow-y-auto">
          <div className="flex-grow p-4">
            <TextEditor />
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

            <div className='flex-grow text-right relative'> {/* Added relative positioning */}
              <button 
                id="dropdownHoverButton" 
                onClick={toggleDropdown} // Updated to toggle dropdown
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
                type="button">
                Dropdown hover 
                <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                </svg>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute bottom-full mb-2 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"> {/* Adjusted position */}
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownHoverButton">
                    <li>
                      <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
                    </li>
                    <li>
                      <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
                    </li>
                    <li>
                      <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
                    </li>
                    <li>
                      <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Sign out</a>
                    </li>
                  </ul>
                </div>
              )}
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
        <div className="flex flex-col space-y-4"> {/* Added space between items */}
          <div className="flex items-center justify-between">
            <p>Outline Insertion</p>
            <button 
              type="button" 
              className="btn hover:bg-purple-400 w-auto text-sm px-2 py-1">
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

