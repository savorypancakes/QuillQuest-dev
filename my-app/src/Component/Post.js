import React from 'react';
import './css/Post.css';

const Post = ({ username, time, title, image, prompt, content, likes, comments }) => {
  return (
    <div className="post">
      <div className="post-header">
        <div className="user-info">
          <div className="user-icon">{username.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <span className="username">{username}</span>
            <span className="time">{time}</span>
          </div>
        </div>
      </div>

      <h2 className="post-title">{title}</h2>

      {image && (
        <div className="post-image">
          <img src={image} alt={title} />
        </div>
      )}

      <div className="post-content">
        <div className="post-prompt">
          <span className="prompt-tag">{prompt}</span>
        </div>
        <p>{content}</p>
      </div>

      <div className="post-footer">
        <button className="like-button">👍 {likes}</button>
        <button className="comment-button">💬 {comments}</button>
      </div>
    </div>
  );
};

export default Post;