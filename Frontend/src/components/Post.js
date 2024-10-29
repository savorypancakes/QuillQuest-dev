import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/components/Post.css';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const Post = ({ post }) => {
  const { auth } = useContext(AuthContext);
  const [likes, setLikes] = useState(post.likes.length);
  const [comments, setComments] = useState(post.comments.length);
  const [hasLiked, setHasLiked] = useState(post.likes.includes(auth.user.id)); // Check if user already liked the post
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
  return (

    <div className='post'>
    <Link to={`/posts/${post._id}`} className='Link'>
      <div className="post-header">
        <div className="user-info">
          <div className="user-icon"></div>
          <div className="user-details">
            <span className="username">{post.username}</span>
            <span className="time">{new Date(post.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="post-prompt"/>
      </div>
      <h2 className="post-title">{post.title}</h2>
      <div className="post-type text-left">{post.postType}</div>
      <div className="post-content text-justify">
        <p>{post.content}</p>
      </div>
    </Link>

      <div className="post-footer">
      <span>
        {hasLiked ? (
          <ThumbUpAltIcon onClick={handleUnlike} className="unlike-button"/>
        ) : (
          <ThumbUpOffAltIcon onClick={handleLike} className="like-button"/>
        )}
        {likes}
        <Link to={`/posts/${post._id}`}><ChatBubbleOutlineIcon className="comment-button"/></Link>{comments}
        </span>
        
      </div>

    </div>
  );
};

export default Post;