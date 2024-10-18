import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Post from '../components/Post.js';
import '../assets/css/index.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch posts from the backend
  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(sortedPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  // Fetch prompts from the backend
  const fetchPrompts = async () => {
    try {
      const response = await api.get('/prompts/all');
      const promptsWithDaysRemaining = response.data.map(prompt => {
        const now = new Date();
        const expiresAt = new Date(prompt.expiresAt);
        const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
        return { ...prompt, daysRemaining: Math.max(0, daysRemaining) };
      });
      setPrompts(promptsWithDaysRemaining);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchPrompts();
  }, []);

  return (
    <div className="bg-[#f8f8f8] min-h-[1024px] pt-20 pb-5 px-5 flex flex-col min-h-screen">
      <Navbar />
      <div className="flex">
        <div className="rounded-lg w-[300px] bg-[#f0f0f0] overflow-y-auto p-5">
          <h2>Prompts of the Day</h2>
          {prompts.map((prompt, index) => (
            <div key={index} className={`bg-[white] shadow-[0_2px_4px_rgba(0,0,0,0.1)] mb-[15px] p-[15px] rounded-lg ${prompt.daysRemaining === 0 ? 'expired' : ''}`}>
              <h3 className='text-lg mt-0'>{prompt.topic}</h3>
              <p className='text-sm text-[#666]'>{prompt.daysRemaining > 0 ? `${prompt.daysRemaining} days remaining` : 'Expired'}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5 items-center flex-1 overflow-y-auto p-5">
          {loading ? (
            <p>Loading...</p>
          ) : (
            posts.map((post) => <Post key={post._id} post={post} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;