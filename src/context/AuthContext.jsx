import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const normalizeRole = (userData = {}) => {
  const roles = [userData.role, ...(userData.roles || [])]
    .filter(Boolean)
    .map((role) => String(role).replace(/^ROLE_/, '').toUpperCase());
  const priority = ['ADMIN', 'DOCTOR', 'PHARMACIST', 'PATIENT', 'USER'];
  return priority.find((role) => roles.includes(role)) || roles[0] || userData.role;
};

const normalizeUser = (userData) => {
  if (!userData) return userData;
  const role = normalizeRole(userData);
  return { ...userData, role };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return normalizeUser(JSON.parse(localStorage.getItem('MedConnect_user'))); }
    catch { return null; }
  });
  const [token, setToken] = useState(
    localStorage.getItem('MedConnect_access_token') || localStorage.getItem('MedConnect_token')
  );

  const login = (userData, authToken) => {
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);
    setToken(authToken);
    if (authToken) {
      localStorage.setItem('MedConnect_access_token', authToken);
    }
    if (normalizedUser) {
      localStorage.setItem('MedConnect_user', JSON.stringify(normalizedUser));
      if (normalizedUser.role) localStorage.setItem('MedConnect_role', normalizedUser.role);
    }
  };


  const updateUser = useCallback((patch) => {
    setUser((current) => {
      const next = normalizeUser({ ...(current || {}), ...(patch || {}) });
      if (next) {
        localStorage.setItem('MedConnect_user', JSON.stringify(next));
        if (next.role) localStorage.setItem('MedConnect_role', next.role);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api.get('/users/me')
      .then(({ data }) => {
        if (cancelled) return;
        const freshUser = normalizeUser(data?.data || data);
        if (freshUser) {
          setUser((current) => {
            const next = normalizeUser({ ...(current || {}), ...freshUser });
            localStorage.setItem('MedConnect_user', JSON.stringify(next));
            if (next.role) localStorage.setItem('MedConnect_role', next.role);
            return next;
          });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token]);
  const logout = () => {
    setUser(null);
    setToken(null);
    ['MedConnect_access_token', 'MedConnect_refresh_token', 'MedConnect_user', 'MedConnect_role', 'MedConnect_token']
      .forEach((key) => localStorage.removeItem(key));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, updateUser, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
