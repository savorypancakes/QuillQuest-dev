// frontend/src/components/Comment.js

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Reply from '../components/Reply';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import '../assets/css/index.css';
import { formatDistanceToNow } from 'date-fns';

const Comment = ({ postId, onCommentsUpdate, onReplyUpdate }) => {
  const { auth } = useContext(AuthContext); // Access auth context for user and token
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReplies, setShowReplies] = useState({});
  const [avatarColors, setAvatarColors] = useState({}); // Store avatar colors for each user

  // Fetch comments for the specific post
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/comments/posts/${postId}/comments`, {
          headers: {
            Authorization: `Bearer ${auth.token}`, // Pass token in Authorization header
          },
        });
        setComments(response.data);
        onCommentsUpdate(response.data); // Update the total comments count in the parent component
        setLoading(false);
      } catch (err) {
        setError('Error loading comments');
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, auth.token]);

  // Fetch avatar colors for users
  useEffect(() => {
    const fetchAvatarColors = async () => {
      try {
        const userIds = [...new Set(comments.map(comment => comment.userId._id))];
        const colors = {};
        await Promise.all(userIds.map(async (userId) => {
          const response = await api.get(`/users/${userId}/profile`, {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          });
          colors[userId] = response.data.avatarColor || 'bg-purple-600';
        }));
        setAvatarColors(colors);
      } catch (err) {
        console.error('Error fetching avatar colors:', err);
      }
    };

    if (comments.length > 0) {
      fetchAvatarColors();
    }
  }, [comments, auth.token]);

  // Submit a new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        `/comments/posts/${postId}/comments`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`, // Pass token in Authorization header
          },
        }
      );

      // Add the new comment with the current user's data to the comments list
      const newCommentData = {
        ...response.data,
        userId: {
          _id: auth.user.id,
          username: auth.user.username,
        },
      };

      const updatedComments = [...comments, newCommentData];
      setComments(updatedComments); // Append the new comment to the list
      onCommentsUpdate(updatedComments); // Update the total comments count in the parent component
      setNewComment(''); // Clear the input
      setLoading(false);
    } catch (err) {
      setError('Failed to submit comment');
      setLoading(false);
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Handle like functionality for comments
  const handleLikeComment = async (commentId) => {
    try {
      const response = await api.put(`/comments/${commentId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId ? { ...comment, likes: response.data.likes } : comment
        )
      );
    } catch (err) {
      console.error('Error liking the comment:', err);
    }
  };

  const handleUnlikeComment = async (commentId) => {
    try {
      const response = await api.put(`/comments/${commentId}/unlike`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId ? { ...comment, likes: response.data.likes } : comment
        )
      );
    } catch (err) {
      console.error('Error unliking the comment:', err);
    }
  };

  const handleReplySubmit = async (commentId, replyContent) => {
    if (!replyContent.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        `/comments/${commentId}/replies`,
        { content: replyContent },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      setComments((prevComments) => {
        const updatedComments = prevComments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [...comment.replies, response.data],
            };
          }
          return comment;
        });
        onCommentsUpdate(updatedComments); // Update the total comments count in the parent component
        if (onReplyUpdate) {
          onReplyUpdate();
        }
        return updatedComments;
      });

      setLoading(false);
    } catch (err) {
      setError('Failed to submit reply');
      setLoading(false);
    }
  };

  return (
    <div className="comment-section bg-white p-4 shadow-lg rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      {/* Display error if any */}
      {error && <p className="text-red-500">{error}</p>}
      {/* New Comment Form */}
      <form onSubmit={handleCommentSubmit} className="mb-4">
        <textarea
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows="3"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add your comment..."
        />
        <button
          type="submit"
          className="w-auto mt-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
      {/* Comment List */}

      <div className="comment-list space-y-4 mb-4">
        {loading && <p>Loading comments...</p>}
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="flex flex-col p-2 bg-[transparent] rounded-md hover:bg-gray-50">
              <div className='flex mt-3'>
                <div className={`${avatarColors[comment.userId._id] || 'bg-purple-600'} text-[white] font-[bold] w-10 h-10 flex items-center justify-center mr-5 rounded-[50%]`}>
                  <span className='font-sans font-bold'>
                    {comment.userId.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className='flex flex-col items-baseline'>
                  <p className="font-semibold">{comment.userId?.username}</p>
                  <p className="text-xs text-gray-500"> • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
                  <p className='mt-5'>{comment.content}</p>
                </div>
              </div>

              <div className="flex">
                {comment.likes.includes(auth.user.id) ? (
                  <ThumbUpAltIcon
                    onClick={() => handleUnlikeComment(comment._id)}
                    className="bg-transparent text-base text-[#9500F0] cursor-pointer m-5 border-[none] hover:no-underline"
                  />
                ) : (
                  <ThumbUpOffAltIcon
                    onClick={() => handleLikeComment(comment._id)}
                    className="bg-transparent text-base text-[#9500F0] cursor-pointer m-5 border-[none] hover:no-underline"
                  />
                )}
                <span className='mt-5 mr-5'>{comment.likes.length}</span>
                <button
                  className="w-auto h-auto p-0 m-0 bg-[transparent] text-black text-sm"
                  onClick={() => toggleReplies(comment._id)}
                >
                  {showReplies[comment._id] ? (
                    <ExpandLessIcon />
                  ) : (
                    <div>
                      <ChatBubbleOutlineIcon className='w-auto bg-transparent text-base text-[#9500F0] cursor-pointer m-5 border-[none] hover:no-underline' />
                      <span>{comment.replies.length }</span>
                    </div>
                  )}
                  {showReplies[comment._id] ? ' Collapse' : ''}
                </button>
              </div>

              {showReplies[comment._id] && (
                <div className="flex flex-col">
                  <Reply commentId={comment._id} onCommentsUpdate={setComments} onReplyUpdate={onReplyUpdate} />
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default Comment;
