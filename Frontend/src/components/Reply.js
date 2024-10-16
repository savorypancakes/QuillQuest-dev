// frontend/src/components/Reply.js

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Reply = ({ commentId }) => {
    const { auth } = useContext(AuthContext);
    const [replies, setReplies] = useState([]);
    const [newReply, setNewReply] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch replies for the specific comment
    useEffect(() => {
        const fetchReplies = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/comments/${commentId}/replies`, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });
                setReplies(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error loading replies');
                setLoading(false);
            }
        };

        fetchReplies();
    }, [commentId, auth.token]);

    // Submit a new reply
    const handleReplySubmit = async (e) => {
        e.preventDefault();

        if (!newReply.trim()) {
            setError('Reply cannot be empty');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post(
                `/comments/${commentId}/replies`,
                { content: newReply, parentCommentId: commentId },
                {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                }
            );

            setReplies([...replies, response.data]); // Append the new reply to the list
            setNewReply(''); // Clear the input
            setLoading(false);
        } catch (err) {
            setError('Failed to submit reply');
            setLoading(false);
        }
    };

    return (
        <div className="reply-section bg-white p-4 shadow-md rounded-lg">
            <h4 className="text-md font-semibold mb-4">Replies</h4>

            {/* Display error if any */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Reply List */}
            <div className="reply-list space-y-4">
                {loading && <p>Loading replies...</p>}
                {replies.length > 0 ? (
                    replies.map((reply) => (
                        <div key={reply._id} className="reply-item p-2 bg-gray-100 rounded-md">
                            <p className="font-semibold">{reply.userId?.username}</p>
                            <p>{reply.content}</p>
                            <p className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString()}</p>
                        </div>
                    ))
                ) : (
                    <p>No replies yet. Be the first to reply!</p>
                )}
            </div>
            {/* New Reply Form */}
            <form onSubmit={handleReplySubmit} className="mb-4 mt-4">
                <textarea
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows="2"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Add your reply..."
                />
                <button
                    type="submit"
                    className="mt-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? 'Posting...' : 'Post Reply'}
                </button>
            </form>


        </div>
    );
};

export default Reply;