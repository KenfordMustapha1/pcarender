// src/Components/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track auth initialization

  useEffect(() => {
    // Check localStorage for existing session
    const email = localStorage.getItem('email');
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    
    if (isLoggedIn && email) {
      setCurrentUser({ 
        email: email,
        id: localStorage.getItem('userId') || null
      });
    }
    
    // Auth check is complete
    setLoading(false);
  }, []);

  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('email', user.email);
    if (user.id) {
      localStorage.setItem('userId', user.id);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};