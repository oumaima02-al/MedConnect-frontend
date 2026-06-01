import { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

const NotificationContext = createContext(null);

/**
 * Wraps the entire app so any component can access notification state
 * without prop-drilling. Mounted once inside AppLayout.
 */
export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || user?.userId || user?.sub || null;
  const notifState = useNotifications(userId);

  const value = useMemo(() => ({ ...notifState, userId }), [notifState, userId]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used inside NotificationProvider');
  return ctx;
}
