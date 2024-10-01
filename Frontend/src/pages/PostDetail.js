// frontend/src/components/PostDetail.js

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const PostDetail = () => {
  const { id } = useParams(); // Get the post ID from the route parameter
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${id}`);
      setPost(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      setLoading(false);
      alert('Failed to load the post');
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  if (loading) {
    return <p>Loading post...</p>;
  }

  if (!post) {
    return <p>Post not found.</p>;
  }

  return (
    <div>
      <Link to="/home">← Back to Home</Link>
      <h2>Post Detail</h2>
      <p>{post.content}</p>
      <small>Posted on: {new Date(post.createdAt).toLocaleString()}</small>
      <hr />
      {/* Optionally, add more details like comments here */}
    </div>
  );
};

export default PostDetail;
