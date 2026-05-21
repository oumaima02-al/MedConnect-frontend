import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('dawini_user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('dawini_access_token'));

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('dawini_access_token', authToken);
    localStorage.setItem('dawini_user', JSON.stringify(userData));
    if (userData?.role) {
      localStorage.setItem('dawini_role', userData.role);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dawini_access_token');
    localStorage.removeItem('dawini_user');
    localStorage.removeItem('dawini_role');
    localStorage.removeItem('dawini_refresh_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};