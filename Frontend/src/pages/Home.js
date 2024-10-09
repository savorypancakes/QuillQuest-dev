import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Post from '../components/Post.js';
import '../assets/css/pages/Home.css';

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
      setPrompts(response.data);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchPrompts();
  }, []);

  return (
    <div className="home-container">
      <Navbar />
      <div className="content-wrapper">
        <div className="prompts-sidebar">
          <h2>Prompts of the Day</h2>
          {prompts.map((prompt, index) => (
            <div key={index} className="prompt-card">
              <h3>{prompt.topic}</h3>
              <p>{`${prompt.daysRemaining} days remaining`}</p>
            </div>
          ))}
        </div>
        <div className="post-feed">
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