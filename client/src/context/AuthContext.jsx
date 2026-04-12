import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      let token = localStorage.getItem('crimelens_token');
      
      // Auto-login for Hackathon Demo
      if (!token) {
        try {
          const res = await authService.login('analyst@crimelens.ai', 'password123');
          localStorage.setItem('crimelens_token', res.data.token);
          setUser(res.data.user);
        } catch (err) {
          console.error("Auto-login failed. Make sure DB is seeded.", err);
        }
      } else {
        try {
          const res = await authService.getMe();
          setUser(res.data.user);
        } catch (err) {
          console.error("Token expired or invalid", err);
          localStorage.removeItem('crimelens_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    localStorage.setItem('crimelens_token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('crimelens_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
