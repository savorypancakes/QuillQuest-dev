import React from 'react';
import { Link } from 'react-router-dom';  
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import '../assets/css/components/Navbar.css';
import logo from '../assets/images/logo-3.png';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
      <Link to="/login"><img src={logo} alt="Logo" className="logo-image" /></Link>
        <div className="logo-text">Quillquest</div>
      </div>

      <div className="navbar-center">
        <ul className="nav-links">
          <li><Link to="/essay-relay"><ChatBubbleOutlineIcon /> Essay Relay</Link></li>
          <li><Link to="/home"><HomeIcon /> Home</Link></li>
          <li><Link to="/create-post"><EditIcon /> Create Post</Link></li>
        </ul>
      </div>

      <div className="navbar-right">
        <button className="icon-button" aria-label="Chat">
          <ChatBubbleOutlineIcon />
        </button>
        <button className="icon-button" aria-label="Notifications">
          <NotificationsNoneIcon />
        </button>
        <Link to="/login"><div className="user-icon">U</div></Link>
      </div>
    </nav>
  );
};

export default Navbar;