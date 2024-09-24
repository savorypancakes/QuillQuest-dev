import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/pages/Register.css';

const Register = () => {
  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="title-text">Create an account</h2>
        <form className='signup-form'>
          <label className='signup-label'>Email</label>
          <input type="email" placeholder="Email" required />
          <label className='signup-label'>Username</label>
          <input type="text" placeholder="Username" required />
          <label className='signup-label'>Password</label>
          <input type="password" placeholder="Password" required />
          <label className='signup-label'>Confirm Password</label>
          <input type="password" placeholder="Confirm Password" required />
          <button className='signup-button' type="submit">Continue</button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;