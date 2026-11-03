import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('campusmind_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campusmind_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('campusmind_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
          localStorage.setItem('campusmind_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: loggedInUser } = res.data;
    setToken(access_token);
    setUser(loggedInUser);
    localStorage.setItem('campusmind_token', access_token);
    localStorage.setItem('campusmind_user', JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const { access_token, user: registeredUser } = res.data;
    setToken(access_token);
    setUser(registeredUser);
    localStorage.setItem('campusmind_token', access_token);
    localStorage.setItem('campusmind_user', JSON.stringify(registeredUser));
    return registeredUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campusmind_token');
    localStorage.removeItem('campusmind_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      isFaculty: user?.role === 'FACULTY',
      isStudent: user?.role === 'STUDENT',
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
