// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token') || null,
    user: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.token) {
        try {
          const response = await api.get('/users/profile', {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          });
          setAuth((prevAuth) => ({
            ...prevAuth,
            user: response.data,
          }));
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setAuth({
            token: null,
            user: null,
          });
          localStorage.removeItem('token');
        }
      }
    };

    fetchUser();
  }, [auth.token]);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    setAuth({
      token,
      user,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({
      token: null,
      user: null,
    });
    
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
