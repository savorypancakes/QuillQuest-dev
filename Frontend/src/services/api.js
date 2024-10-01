// frontend/src/services/api.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  
});

// Add a request interceptor to include JWT token if available
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

export default api;
