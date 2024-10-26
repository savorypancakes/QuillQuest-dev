// frontend/src/components/Reply.js

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

const Reply = ({ commentId, onCommentsUpdate }) => {
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

            // Add the new reply with the current user's data to the replies list
            const newReplyData = {
                ...response.data,
                userId: {
                    _id: auth.user.id,
                    username: auth.user.username,
                },
            };
            const updatedReplies = [...replies, newReplyData];
            setReplies(updatedReplies); // Append the new reply to the list

            // Update the total comments and replies count in the parent component
            if (onCommentsUpdate) {
                onCommentsUpdate((prevComments) =>
                    prevComments.map((comment) =>
                        comment._id === commentId
                            ? { ...comment, replies: updatedReplies }
                            : comment
                    )
                );
            }
            setNewReply(''); // Clear the input
            setLoading(false);
        } catch (err) {
            setError('Failed to submit reply');
            setLoading(false);
        }
    };

    const handleLikeReply = async (replyId) => {
        try {
            const response = await api.put(`/replies/${replyId}/like`, {}, {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            setReplies((prevReplies) =>
                prevReplies.map((reply) =>
                    reply._id === replyId ? { ...reply, likes: response.data.likes } : reply
                )
            );
        } catch (err) {
            console.error('Error liking the reply:', err);
        }
    };

    const handleUnlikeReply = async (replyId) => {
        try {
            const response = await api.put(`/replies/${replyId}/unlike`, {}, {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            setReplies((prevReplies) =>
                prevReplies.map((reply) =>
                    reply._id === replyId ? { ...reply, likes: response.data.likes } : reply
                )
            );
        } catch (err) {
            console.error('Error unliking the reply:', err);
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
                        <div key={reply._id} className="reply-item p-2 bg-[transparent] rounded-md">
                            <div className='flex mt-0'>
                                <div className="ml-3 bg-[#9500F0] text-[white] font-[bold] w-10 h-10 flex items-center justify-center mr-5 rounded-[50%]">
                                    <span className='font-sans font-bold'>
                                        {reply.userId.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className='flex flex-col items-baseline'>
                                    <p className="font-semibold">{reply.userId?.username}</p>
                                    <p className="text-xs text-gray-500"> • {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</p>
                                    <p>{reply.content}</p>
                                </div>
                            </div>
                            <div className="flex items-center mt-2 ml-14">
                                {reply.likes && reply.likes.includes(auth.user.id) ? (
                                    <ThumbUpAltIcon
                                        onClick={() => handleUnlikeReply(reply._id)}
                                        className="cursor-pointer text-[#9500F0] mr-2"
                                    />
                                ) : (
                                    <ThumbUpOffAltIcon
                                        onClick={() => handleLikeReply(reply._id)}
                                        className="cursor-pointer text-[#9500F0] mr-2"
                                    />
                                )}
                                <span>{reply.likes ? reply.likes.length : 0}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No replies yet. Be the first to reply!</p>
                )}
            </div>

            {/* New Reply Form */}
            <form onSubmit={handleReplySubmit} className="mb-4 mt-4">
                <textarea
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows="2"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Add your reply..."
                />
                <div className='flex'>
                    <button
                        type="submit"
                        className="w-auto mt-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        disabled={loading}
                    >
                        {loading ? 'Posting...' : 'Post Reply'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Reply;