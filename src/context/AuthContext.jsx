import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('MedConnect_user')); }
    catch { return null; }
  });
  const [token, setToken] = useState(
    localStorage.getItem('MedConnect_access_token') || localStorage.getItem('MedConnect_token')
  );

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    if (authToken) {
      localStorage.setItem('MedConnect_access_token', authToken);
    }
    if (userData) {
      localStorage.setItem('MedConnect_user', JSON.stringify(userData));
      if (userData.role) localStorage.setItem('MedConnect_role', userData.role);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    ['MedConnect_access_token', 'MedConnect_refresh_token', 'MedConnect_user', 'MedConnect_role', 'MedConnect_token']
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
