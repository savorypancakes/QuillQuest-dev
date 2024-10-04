import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Post from '../components/Post.js';
import '../assets/css/pages/Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch posts from the backend
  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');  // Ensure '/posts' endpoint is correct
      setPosts(response.data);  // Assigning actual data to posts
      const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort posts by latest first
      setPosts(sortedPosts);
      setLoading(false);  // Update loading state once data is fetched
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);  // Even on error, set loading to false
    }
  };

  // Fetch posts when the component mounts
  useEffect(() => {
    fetchPosts();
  }, []);  // Empty dependency array ensures it runs only once when component mounts

  return (
    <div className="home-container">
      <Navbar />
      <div className="prompt-section">
        <div className="prompt-card">
          <h3>Prompt of the Day</h3>
          <p>Is the bald eagle the best symbol to represent the US?</p>
          <span>7 days remaining</span>
        </div>
        <div className="prompt-card">
          <h3>Yesterday's Prompt</h3>
          <p>Should plastic bags be banned worldwide?</p>
          <span>6 days remaining</span>
        </div>
        <div className="prompt-card">
          <h3>2 days ago</h3>
          <p>Is nuclear energy a viable solution to the world's energy problems?</p>
          <span>5 days remaining</span>
        </div>
      </div>
      <div className="post-feed">
        {loading ? (
          <p>Loading...</p>
        ) : (
          posts.map((post) => <Post key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Home;
