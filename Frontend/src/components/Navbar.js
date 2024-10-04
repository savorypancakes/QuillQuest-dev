import React, { useState, useContext} from 'react';
import { Link } from 'react-router-dom';  
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import '../assets/css/components/Navbar.css';
import logo from '../assets/images/logo-3.png';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {

  const { auth, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      {/* Left section with logo and text */}
      <div className="navbar-left">
      <Link to="/home"><img src={logo} alt="Logo" className="logo-image" /></Link>
        <div className="logo-text">Quillquest</div>
      </div>


      <div className="navbar-right">
        <ul className="nav-links">
          <li><Link to="/home"> Home <HomeIcon /></Link></li>
          <li><Link to="/createpost"> Create  <EditIcon /></Link></li>
        </ul>
        {/* <button className="icon-button" aria-label="Notifications">
          <NotificationsNoneIcon />
        </button> */}
        {auth.user && (
        <div className="user-icon">
          <button onClick={toggleDropdown} className="profile-btn">
            {auth.user.name} {/* Display user's name */}
            <span className="dropdown-arrow"></span>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item" onClick={toggleDropdown}>
                Profile
              </Link>
              <button className="dropdown-item" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </nav>
  );
};

export default Navbar;