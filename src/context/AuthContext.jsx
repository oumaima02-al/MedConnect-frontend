import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dawini_user')); }
    catch { return null; }
  });
  const [token, setToken] = useState(
    localStorage.getItem('dawini_access_token') || localStorage.getItem('dawini_token')
  );

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    if (authToken) {
      localStorage.setItem('dawini_access_token', authToken);
    }
    if (userData) {
      localStorage.setItem('dawini_user', JSON.stringify(userData));
      if (userData.role) localStorage.setItem('dawini_role', userData.role);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    ['dawini_access_token', 'dawini_refresh_token', 'dawini_user', 'dawini_role', 'dawini_token']
      .forEach((key) => localStorage.removeItem(key));
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
