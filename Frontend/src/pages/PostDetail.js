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
      console.log('Post data:', response.data); // Log the response data
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
    <div className="flex flex-col bg-[transparent] mx-[20%] pt-20 pb-5 px-5">
      <Navbar />
      <Link to="/home" className="back-link">← Back to Home</Link>
      <div className='flex'>
        <div className="bg-[#9500F0] text-[white] font-[bold] w-10 h-10 flex items-center justify-center mr-5 rounded-[50%]"></div>
        <div className="flex flex-col items-baseline">
          <span className='font-semibold text-black'> {post.userId?.username || 'Unknown'}</span>
          <span className='text-[gray] text-[0.85rem]'>Posted on: {new Date(post.createdAt).toLocaleString()}</span>
        </div>
      </div>


      <h2 className="text-black font-bold text-2xl text-left mt-5 mb-[15px] mx-0">{post.title}</h2>

      <div className="pb-5">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>


      <div className="flex justify-between">
        <span>
          {hasLiked ? (
            <ThumbUpAltIcon onClick={handleUnlike} className="bg-transparent text-base text-[#9500F0] cursor-pointer m-5 border-[none] hover:no-underline" />
          ) : (
            <ThumbUpOffAltIcon onClick={handleLike} className="bg-transparent text-base text-[#9500F0] cursor-pointer m-5 border-[none] hover:no-underline" />
          )}
          {likes}
          <ChatBubbleOutlineIcon className="bg-transparent text-base text-[#9500F0] cursor-pointer m-5 border-[none] hover:no-underline" />
          {comments}
        </span>
      </div>
      <hr />
      {/* Comments Section */}
      <Comment postId={post._id} onCommentsUpdate={updateCommentsCount}/>


    </div>
  );
};

export default PostDetail;