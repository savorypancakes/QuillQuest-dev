import React from 'react';
import { Link } from 'react-router-dom';  
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import '../assets/css/components/Navbar.css';
import logo from '../assets/images/logo-3.png';

const Navbar = () => {
  return (
    <nav className="navbar">
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
        <Link to="/login"><div className="user-icon"></div></Link>
      </div>
    </nav>
  );
};

export default Navbar;