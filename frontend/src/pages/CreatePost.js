import React from 'react';
import TextEditor from '../components/TextEditor';
import '../assets/css/index.css'; // Ensure you have Tailwind's CSS imported

const CreatePost = () => {
  return (
    <div className="flex flex-wrap">
      {/* //division 1: return to post feed page */}
      <div className="border w-1/12 mt-4">
        <button 
          type="button" 
          className=" mr-4 btn bg-purple-600 bg-opacity-100 text-white hover:bg-opacity-80 transition"
        >
          Primary
        </button>
      </div>
      {/* division 2: text editor + post type picker + post button */}
      <div className="border w-8/12 mt-4">
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

        <div>
          <button 
            type="button" 
            className=" mr-4 btn bg-purple-600 bg-opacity-100 text-white hover:bg-opacity-80 transition"
          >
            Discussion
          </button>
          <button 
            type="button" 
            className=" mr-4 btn bg-purple-600 bg-opacity-100 text-white hover:bg-opacity-80 transition"
          >
            Advice and Feedback
          </button>
        </div>
        <div>
          <button 
            type="button" 
            className=" mr-4 btn bg-purple-600 bg-opacity-100 text-white hover:bg-opacity-80 transition"
          >
            Post
          </button>
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
