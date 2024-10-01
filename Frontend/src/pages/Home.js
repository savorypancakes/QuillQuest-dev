import React from 'react';
import { useState, useEffect } from 'react';
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
      const response = await api.get('/posts');
      
      setPosts(response.status);
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching posts:', error);


    }
  };

  return (
    <div className="home-container">
      <Navbar />
      <div className="post-feed">
      { posts.map((post) => <Post key={post._id} post={post} />)}
      </div>
    </div>
  );
};

export default Home;