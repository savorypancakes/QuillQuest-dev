// frontend/src/components/Comment.js

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Comment = ({ postId }) => {
  const { auth } = useContext(AuthContext); // Access auth context for user and token
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch comments for the specific post
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/posts/${postId}/comments`, {
          headers: {
            Authorization: `Bearer ${auth.token}`, // Pass token in Authorization header
          },
        });
        setComments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading comments');
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, auth.token]);

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
        `/posts/${postId}/comments`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`, // Pass token in Authorization header
          },
        }
      );

      setComments([...comments, response.data]); // Append the new comment to the list
      setNewComment(''); // Clear the input
      setLoading(false);
    } catch (err) {
      setError('Failed to submit comment');
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
          className="mt-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comment List */}
      <div className="comment-list space-y-4">
        {loading && <p>Loading comments...</p>}
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="comment-item p-2 bg-gray-100 rounded-md">
              <p className="font-semibold">{comment.user.username}</p>
              <p>{comment.content}</p>
              <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
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
