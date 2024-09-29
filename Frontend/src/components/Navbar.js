import React from 'react';
import { Link } from 'react-router-dom';  
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import '../assets/css/components/Navbar.css';  // Make sure the CSS path is correct
import logo from '../assets/images/logo-3.png'; // Ensure the logo path is correct

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Left section with logo and text */}
      <div className="navbar-left">
        <Link to="/">
          <img src={logo} alt="Logo" className="logo-image" />
          <div className="logo-text">QuillQuest</div> 
        </Link>
      </div>

      {/* Center section with Home and Create Post */}
      <div className="navbar-center">
        <Link to="/home" className="icon-button">
          <HomeIcon className="nav-icon" />
          Home
        </Link>
        <Link to="/createpost" className="icon-button">
          <EditIcon className="nav-icon" />
          Create Post
        </Link>
      </div>

      {/* Right section with notifications and user profile */}
      <div className="navbar-right">
        <button className="icon-button" aria-label="Notifications">
          <NotificationsNoneIcon />
        </button>
        <Link to="/profile">
          <div className="user-icon">U</div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;