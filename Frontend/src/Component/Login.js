import React from 'react';
import { Link } from 'react-router-dom';
import './css/Login.css';
import logo from '../assets/logos/logo-2.png';

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-box">
      <div className="logo-section">
          <img src={logo} alt="Logo" className="logo-image2" />
          <div className="logo">QuillQuest</div>
        </div>
        <div className="form-section">
          <h2 className="welcome-text">Welcome back!</h2>
          <p className="sub-text">It's good to see you again</p>
          <form className='login-form'>
            <label className='login-label'>Email</label>
            <input type="email" placeholder="Email" required />
            <label className='login-label'>Password</label>
            <input type="password" placeholder="Password" required />
            <div className="forgot-password">
              <Link to="/home">Forget password? - Temp pass to Home Page</Link>
            </div>
            <button className='login-button' type="submit">➤
              <Link to="/home"></Link>
            </button>
            </form>
          <p className="signup-link">
            Don’t have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;