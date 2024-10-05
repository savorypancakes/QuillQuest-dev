import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../assets/css/pages/Login.css';
import logo from '../assets/images/logo-2.png';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

const Login = () => {

  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Use AuthContext

  // State variables for form inputs and feedback
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear specific field error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }

    // Clear server error when user starts typing
    if (serverError) {
      setServerError('');
    }
  };

  // Validate form inputs
  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return; // Stop submission if there are validation errors
    }

    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');
    
    try {
      
      
      const response = await api.post('/auth/login', {
        "email": formData.email,
        "password": formData.password,
      });
      console.log(formData.email);
      console.log(formData.password);
      // Assuming backend returns token and user info
      const { token, user } = response.data;

      // Store token in localStorage or any state management
      localStorage.setItem('token', token);

      // Update auth state using context
      login(token, user);
      
      // Optionally, store user info in context or state
      // Redirect to dashboard or home page
      setSuccessMessage('Login successful! Redirecting...');
      navigate('/home');
      
    } catch (error) {
      if (error.response && error.response.data) {
        setServerError(error.response.data.message || 'Login failed');
      } else {
        setServerError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
      
    }
  };

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
          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="login-form">
              <label className="login-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                required
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="login-form">
              <label className="login-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                required
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
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