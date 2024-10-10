import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/components/Post.css';

const Post = ({ post }) => {
  return (
    <Link to={`/posts/${post._id}`} className="post">
      <div className="post-header">
        <div className="user-info">
          <div className="user-icon"></div>
          <div className="user-details">
            <span className="username">{post.username}</span>
            <span className="time">{new Date(post.createdAt).toLocaleString()}</span>
          </div>
        </div>
        {post.postType && <div className="post-type">{post.postType}</div>}
      </div>

      <h2 className="post-title">{post.title}</h2>

      <div className="post-content">
        {post.prompt && <div className="post-prompt">Prompt: {post.prompt.topic}</div>}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      <div className="post-footer">
        <button className="like-button">👍</button>
        <button className="comment-button">💬</button>
      </div>
    </Link>
  );
};

export default Post;