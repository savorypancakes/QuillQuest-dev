import React from 'react';
import '../assets/css/components/Post.css';

const Post = ({ post }) => {
  return (
    <div className="post">
      <div className="post-header">
        <div className="user-info">
          <div className="user-icon"></div>
          {/* {post.author.username.charAt(0).toUpperCase()}  | In user icon frame*/}
          <div className="user-details">
            {/* <span className="username">{post.author.username}</span>
            <span className="time">{new Date(post.createdAt).toLocaleString()}</span> */}
          </div>
        </div>
      </div>

      <h2 className="post-title">{post.title}</h2>

      

      <div className="post-content">
      <div className="post-prompt">
            {/* {post.tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))} */}
          </div>
        <p>{post.content}</p>
      </div>

      <div className="post-footer">
        <button className="like-button">👍 </button>
        <button className="comment-button">💬 </button>
      </div>
    </div>
  );
};

export default Post;