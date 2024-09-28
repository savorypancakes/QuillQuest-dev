import React, { useState } from "react";
import TextEditor from '../components/TextEditor';
import '../assets/css/index.css'; // Ensure you have Tailwind's CSS imported

const CreatePost = () => {
  // Managing selected radio button option using useState
  const [selectedOption, setSelectedOption] = useState("option1");

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className="flex h-screen w-full">
      {/* //division 1: return to post feed page */}
      <div className="border w-1/12 mt-4">
        <button 
          type="button" 
          className="mr-4 btn bg-purple-600 bg-opacity-100 text-white hover:bg-opacity-80 transition"
        >
          Primary
        </button>
      </div>
      {/* division 2: text editor + post type picker + post button */}
      <div className="border w-8/12 h-screen mt-4">
        <div className="mt-4">
          <input
            type="text"
            className="border-0 shadow-none fs-4 fw-bold w-full py-2 px-3 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
            id="title"
            placeholder="Untitled document"
          />
        </div>
        <div className="mt-4">
          <TextEditor />
        </div>

        <div className='flex'>
          <div class="w-6/12 inline-flex rounded-md shadow-sm" role="group">
            <button type="button" class="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-gray-900 rounded-s-lg focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
              Select Post Type
            </button>
            <button type="button" class="px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-gray-900 hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
              Discussion
            </button>
            <button type="button" class="px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-e-lg hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
              Advice and Feedback
            </button>
          </div>
          <div className='w-6/12'> 
            <button 
              type="button" 
              className=" mr-4 btn bg-purple-600 bg-opacity-100 text-white hover:bg-opacity-80 transition"
            >
              Post
            </button>
          </div>
        </div>
      </div>
      {/* //division 2: writing assistant + dashboard */}
      <div className="w-3/12 mt-4 border">
        <button type="button" className="ml-4 btn bg-purple-600 bg-opacity-100 text-white hover:bg-opacity-80 transition">
          Writing Assistant
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
