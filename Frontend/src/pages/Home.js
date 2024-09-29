import React from 'react';
import Navbar from '../components/Navbar';
import Post from '../components/Post';
import '../assets/css/pages/Home.css';

const Home = () => {
  const posts = [
    {
      username: 'username0',
      time: '14 minutes ago',
      title: 'Why I believe the bald eagle shouldn’t be the symbol of the USA',
      prompt: 'Is the bald eagle the best symbol to represent the US?',
      content: 'The bald eagle, with its majestic presence and powerful flight, has long stood as a symbol of the United States...',
      likes: '1.4K',
      comments: '1.4K',
      imageUrl: '/path/to/eagle-image.jpg' // Replace with actual image URLs
    },
    {
      username: 'QuillBot',
      time: '5 minutes ago',
      title: 'Why I believe the bald eagle is the perfect symbol of the USA',
      prompt: 'Is the bald eagle the best symbol to represent the US?',
      content: 'The bald eagle, with its majestic presence and powerful flight, has long stood as a symbol of the United States...',
      likes: '1.4K',
      comments: '1.4K',
      imageUrl: '/path/to/another-eagle-image.jpg' // Replace with actual image URLs
    },
  ];

  return (
    <div className="home-container">
      <Navbar />
      <div className="prompt-section">
        <div className="prompt-card">
          <h3>Prompt of the Day</h3>
          <p>Is the bald eagle the best symbol to represent the US?</p>
          <span>7 days remaining</span>
        </div>
        <div className="prompt-card">
          <h3>Yesterday's Prompt</h3>
          <p>Should plastic bags be banned worldwide?</p>
          <span>6 days remaining</span>
        </div>
        <div className="prompt-card">
          <h3>2 days ago</h3>
          <p>Is nuclear energy a viable solution to the world's energy problems?</p>
          <span>5 days remaining</span>
        </div>
      </div>
      <div className="post-feed">
        {posts.map((post, index) => (
          <Post 
            key={index}
            username={post.username}
            time={post.time}
            title={post.title}
            image={post.imageUrl}
            prompt={post.prompt}
            content={post.content}
            likes={post.likes}
            comments={post.comments}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;