import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api'; // Ensure this is the correct API service you're using
import Comment from '../components/Comment';
import Reply from '../components/Reply';
import { AuthContext } from '../context/AuthContext';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import '../assets/css/index.css';
import Navbar from '../components/Navbar';

const PostDetail = () => {
  const { id } = useParams(); // Get the post ID from the URL parameter
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // To handle errors
  const { auth } = useContext(AuthContext);
  const [likes, setLikes] = useState(0); // Check post's liked
  const [hasLiked, setHasLiked] = useState(false); // Check if user already liked the post
  const [comments, setComments] = useState(0);
  const [showReplies, setShowReplies] = useState({});

  // Function to like a post
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

  // Function to unlike a post
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
      setPost(response.data); // Store the post data in state
      setLikes(response.data.likes.length); // Set initial number of likes
      setHasLiked(response.data.likes.includes(auth.user.id)); // Check if the current user has liked the post
      // Calculate total number of comments and replies
      const totalCommentsAndReplies = response.data.comments.length + response.data.comments.reduce((acc, comment) => {
        return acc + (comment.replies ? comment.replies.length : 0);
      }, 0);
      setComments(totalCommentsAndReplies);
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

  // Function to update comments count when a new comment or reply is added
  const updateCommentsCount = (newComments) => {
    const totalCommentsAndReplies = newComments.length + newComments.reduce((acc, comment) => {
      return acc + (comment.replies ? comment.replies.length : 0);
    }, 0);
    setComments(totalCommentsAndReplies);
  };
  
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
    <div className="bg-[white] min-h-screen pt-20 pb-5 px-5">
      <Navbar />
      <div className="w-full max-w-5xl mx-auto mt-5">
        <Link to="/home" className="block text-purple-600 mb-5">← Back to Home</Link>
        <div className="bg-white p-5 rounded-lg">
          <div className='flex items-center mb-5'>
            <div className="bg-[#9500F0] text-white font-bold w-10 h-10 flex items-center justify-center overflow-hidden text-xl rounded-full mr-5">
              {post.userId.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <div className='flex'>
                <span className='font-semibold text-black'>{post.userId?.username || 'Unknown'}</span>
              </div>
              
              <span className='text-gray-500 text-sm'>Posted on: {new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className='flex'>
            <h2 className="text-black font-bold text-2xl mb-4">{post.title}</h2>
          </div>
          
          <div className="flex mb-4">
            {post.postType && <div className="bg-[#9500F0] text-white text-sm inline-block px-4 py-1 rounded-full">{post.postType}</div>}
          </div>
          <div className="mb-5" dangerouslySetInnerHTML={{ __html: post.content }} />
          <div className="flex items-center mb-5">
            {hasLiked ? (
              <ThumbUpAltIcon onClick={handleUnlike} className="text-[#9500F0] cursor-pointer mr-3" />
            ) : (
              <ThumbUpOffAltIcon onClick={handleLike} className="text-[#9500F0] cursor-pointer mr-3" />
            )}
            <span className="mr-5">{likes}</span>
            <ChatBubbleOutlineIcon className="text-[#9500F0] cursor-pointer mr-3" />
            <span>{comments}</span>
          </div>
          <hr className="my-5" />
          {/* Comments Section */}
          <Comment postId={post._id} onCommentsUpdate={updateCommentsCount}/>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;