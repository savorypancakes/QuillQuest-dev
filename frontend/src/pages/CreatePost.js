import React, { useState, useRef, useEffect, useCallback } from "react"; // Import React and its hooks
import TextEditor from '../components/TextEditor'; // Import the TextEditor component
import '../assets/css/index.css'; // Import CSS styles
import { ChatGroq } from "@langchain/groq"; // Import ChatGroq for AI functionality
import { Link } from 'react-router-dom';  

// Define the main CreatePost component
const CreatePost = () => {
  // State variables using the useState hook
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown menu open/close
  const [apiKeyError, setApiKeyError] = useState(false); // State for API key error
  const [editorContent, setEditorContent] = useState(''); // State for editor content
  const [title, setTitle] = useState(''); // State for the title input
  const editorContainerRef = useRef(null); // Ref for the editor container
  const [editorWidth, setEditorWidth] = useState('100%'); // State for editor width

  // Function to generate an outline using AI
  const generateOutline = useCallback(async () => {
    // Check if the title is empty
    if (!title.trim()) {
      alert("Please enter a title or topic before generating an outline.");
      return;
    }

    try {
      // Get the API key from environment variables
      const apiKey = process.env.REACT_APP_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("Groq API key not found");
      }

      // Initialize the ChatGroq instance
      const llm = new ChatGroq({
        apiKey: apiKey,
        model: "llama3-8b-8192",
        temperature: 0,
        maxTokens: undefined,
        maxRetries: 2,
      });

      // Send a request to the AI model
      const aiMsg = await llm.invoke([
        {
          role: "system",
          content: "Generate an outline of an essay based on the user's title or topic. Only generate an essay outline, no greetings. Ensure the outline only guides the user to think",
        },
        { role: "user", content: title },
      ]);
      console.log("Generated outline:", aiMsg.content);

      // Process the AI response and update the editor content
      const processedResult = aiMsg.content.split('\n').map(line => `<p>${line}</p>`).join('');
      setEditorContent(processedResult);
      setApiKeyError(false);
    } catch (error) {
      console.error("Outline generation error:", error);
      if (error.message.includes("API key")) {
        setApiKeyError(true);
      } else {
        setEditorContent("<p>Error: Outline generation failed</p>");
      }
    }
  }, [title]); // This function depends on the 'title' state

  // Effect hook to handle editor width responsiveness
  useEffect(() => {
    const updateEditorWidth = () => {
      if (editorContainerRef.current) {
        setEditorWidth(`${editorContainerRef.current.offsetWidth}px`);
      }
    };

    updateEditorWidth(); // Call immediately
    window.addEventListener('resize', updateEditorWidth); // Add event listener for window resize

    // Cleanup function to remove event listener
    return () => window.removeEventListener('resize', updateEditorWidth);
  }, []); // Empty dependency array means this effect runs once on mount

  // Function to toggle the dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Function to handle changes in the editor content
  const handleEditorChange = (content) => {
    setEditorContent(content);
  };

  // The main JSX returned by the component
  return (
    <div className="flex w-full h-screen">
      <div className="flex flex-col w-full">
        {/* Header Section */}
        <div className="flex items-center h-12 p-2 bg-gray-300 text-center border-b border-gray-400">
          <div className="w-1/12 ">
            <Link to="/home"
              className="rounded-full w-auto px-4 py-1 text-sm bg-purple-600 bg-opacity-100 text-white hover:no-underline hover:bg-opacity-80"
            >
              Home
            </Link>
          </div>
          <div className="w-9/12 flex flex-col flex-grow text-left ml-4 mt-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-0 shadow-none bg-white placeholder-gray-700 font-bold py-1 px-3 focus:outline-none focus:bg-gray-100 hover:bg-gray-100"
              id="title"
              placeholder="Enter your essay title or topic"
            />
          </div>
          <div className="w-2/12">
            <button 
              type="button" 
              className="w-auto px-4 py-1 text-sm bg-purple-600 bg-opacity-100 text-white hover:bg-opacity-80"
            >
              Writing Assistant
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex w-full flex-grow overflow-hidden">
          <div ref={editorContainerRef} className="flex-grow overflow-y-auto overflow-x-hidden p-4">
            <div style={{ width: editorWidth, maxWidth: '100%' }}>
              <TextEditor 
                initialContent={editorContent}
                onContentChange={handleEditorChange}
                className="overflow-x-hidden"
                editorStyles={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}
              />
              {apiKeyError && (
                <p className="text-red-500 mt-2">
                  Error: Groq API key not found. Please set the REACT_APP_GROQ_API_KEY environment variable.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-2 bg-gray-200 text-center border-t border-gray-300">
          <div className='flex mt-auto'>
            {/* Post Type Selection Buttons */}
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
            {/* Dropdown Menu */}
            <div className='flex-grow text-right relative'> 
              <button 
                onClick={toggleDropdown}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" 
                type="button"
              >
                Dropdown hover
                <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                </svg>
              </button>

              {/* Dropdown menu items */}
              {dropdownOpen && (
                <div className="absolute right-0 bottom-full mb-2 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
                  <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdownHoverButton">
                    <li>
                      <button onClick={() => {}} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Dashboard</button>
                    </li>
                    <li>
                      <button onClick={() => {}} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Settings</button>
                    </li>
                    <li>
                      <button onClick={() => {}} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Earnings</button>
                    </li>
                    <li>
                      <button onClick={() => {}} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Sign out</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            {/* Button for Post Submission */}
            <button type="button" className="ml-3 text-white bg-green-500 hover:bg-green-600 px-4 py-2 text-sm font-medium rounded-lg">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
