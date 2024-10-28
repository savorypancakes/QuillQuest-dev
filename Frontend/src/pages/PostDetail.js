import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api'; // Ensure this is the correct API service you're using
import '../assets/css/pages/PostDetail.css'
import Comment from '../components/Comment';
import { AuthContext } from '../context/AuthContext';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const PostDetail = () => {
  const { id } = useParams(); // Get the post ID from the URL parameter
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // To handle errors
  const { auth } = useContext(AuthContext);
  const [likes, setLikes] = useState(0); // Check post's liked
  const [hasLiked, setHasLiked] = useState(false); // Check if user already liked the post
  const [comments, setComments] = useState(0);
  // // Function to like a post
  const handleLike = async () => {
    try {
      const response = await api.put(`/posts/${post._id}/like`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setLikes(response.data.likes);
      setHasLiked(true);
    } catch (err) {
      console.error('Error liking the post:', err);
    }
  };

  // // Function to unlike a post
  const handleUnlike = async () => {
    try {
      const response = await api.put(`/posts/${post._id}/unlike`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setLikes(response.data.likes);
      setHasLiked(false);
    } catch (err) {
      console.error('Error unliking the post:', err);
    }
  };
  // Function to fetch the post details from the backend
  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${id}`); // Fetch post by ID
      console.log('Post data:', response.data); // Log the response data
      setPost(response.data); // Store the post data in state
      setLikes(response.data.likes.length); // Set initial number of likes
      setHasLiked(response.data.likes.includes(auth.user.id)); // Check if the current user has liked the post
      setComments(response.data.comments.length);
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
        <span> by {post.userId?.username || 'Unknown'}</span>
      </div>

      <h2 className="post-title">{post.title}</h2>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      <hr className="post-divider" />
      <div className="LikeCounter">
      <span>
        {hasLiked ? (
          <ThumbUpAltIcon onClick={handleUnlike} className="unlike-button"/>
        ) : (
          <ThumbUpOffAltIcon onClick={handleLike} className="like-button"/>
        )}
        {likes}
        <ChatBubbleOutlineIcon className="comment-button"/>
        {comments}
        </span>
      </div>
      
      {/* Additional post details such as comments can be added here */}
      <Comment postId={post._id}/>
    </div>
  );
};

export default PostDetail;
