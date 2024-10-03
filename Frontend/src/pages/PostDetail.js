import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api'; // Ensure this is the correct API service you're using
import '../assets/css/pages/PostDetail.css'

const PostDetail = () => {
  const { id } = useParams(); // Get the post ID from the URL parameter
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // To handle errors

  // Function to fetch the post details from the backend
  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${id}`); // Fetch post by ID
      setPost(response.data); // Store the post data in state
      setLoading(false); // Set loading to false once data is loaded
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load the post');
      setLoading(false); // Set loading to false in case of an error
    }
  };

  // UseEffect to run the fetch function when the component is mounted or when the ID changes
  useEffect(() => {
    fetchPost();
  }, [id]);

  // Loading state
  if (loading) {
    return <p>Loading post...</p>;
  }

  // Error handling
  if (error) {
    return <p>{error}</p>;
  }

  // If post is not found or undefined
  if (!post) {
    return <p>Post not found.</p>;
  }

  // Display the post details
  return (
    <div className="post-detail-container">
      <Link to="/home" className="back-link">← Back to Home</Link>

      <div className="post-meta">
        <small>Posted on: {new Date(post.createdAt).toLocaleString()}</small>
      </div>

      <h2 className="post-title">{post.title}</h2>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      <hr className="post-divider" />

      {/* Additional post details such as comments can be added here */}
    </div>
  );
};

export default PostDetail;
