import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAllNotifications,
  getUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
  optIn,
  optOut,
} from '../services/notificationService';

const POLL_INTERVAL_MS = 30_000; // poll for new notifications every 30 seconds

/**
 * Central hook for the notification system.
 * - Polls for unread count in the background
 * - Loads full notification list on demand
 * - Manages user preferences (read/write)
 */
export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState(null);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [error, setError] = useState(null);

  const pollRef = useRef(null);

  // ── Fetch unread count (lightweight, runs on poll interval) ──────────
  const refreshUnreadCount = useCallback(async () => {
    if (!userId) return;
    try {
      const unread = await getUnreadNotifications(userId);
      setUnreadCount(unread.length);
    } catch {
      // silently fail — badge is non-critical
    }
  }, [userId]);

  // ── Fetch full notification list ─────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoadingList(true);
    setError(null);
    try {
      const data = await getAllNotifications(userId);
      // Sort: unread first, then by date descending
      const sorted = [...data].sort((a, b) => {
        if (!a.read && b.read) return -1;
        if (a.read && !b.read) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setNotifications(sorted);
      const unread = sorted.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des notifications.');
    } finally {
      setLoadingList(false);
    }
  }, [userId]);

  // ── Mark one notification as read ────────────────────────────────────
  const markRead = useCallback(async (notificationId) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
      )
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markNotificationRead(notificationId);
    } catch (err) {
      // Roll back on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: false, readAt: null } : n))
      );
      setUnreadCount((c) => c + 1);
      setError(err.message);
    }
  }, []);

  // ── Mark all as read ─────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    if (!userId) return;
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);
    try {
      await markAllNotificationsRead(userId);
    } catch (err) {
      // Re-sync on failure
      fetchNotifications();
      setError(err.message);
    }
  }, [userId, fetchNotifications]);

  // ── Delete a notification ─────────────────────────────────────────────
  const remove = useCallback(async (notificationId) => {
    const prev = notifications;
    setNotifications((list) => list.filter((n) => n.id !== notificationId));
    try {
      await deleteNotification(notificationId);
      setUnreadCount((c) => {
        const wasUnread = prev.find((n) => n.id === notificationId && !n.read);
        return wasUnread ? Math.max(0, c - 1) : c;
      });
    } catch (err) {
      setNotifications(prev); // rollback
      setError(err.message);
    }
  }, [notifications]);

  // ── Preferences ──────────────────────────────────────────────────────
  const fetchPreferences = useCallback(async () => {
    if (!userId) return;
    setLoadingPrefs(true);
    try {
      const data = await getPreferences(userId);
      setPreferences(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPrefs(false);
    }
  }, [userId]);

  const savePreferences = useCallback(async (updatedPrefs) => {
    if (!userId) return;
    setSavingPrefs(true);
    setError(null);
    try {
      const data = await updatePreferences(userId, updatedPrefs);
      setPreferences(data);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSavingPrefs(false);
    }
  }, [userId]);

  const toggleOptOut = useCallback(async (type) => {
    if (!userId || !preferences) return;
    const isOptedOut = preferences.optedOutTypes?.includes(type);
    try {
      const updated = isOptedOut
        ? await optIn(userId, type)
        : await optOut(userId, type);
      setPreferences(updated);
    } catch (err) {
      setError(err.message);
    }
  }, [userId, preferences]);

  // ── Bootstrap & polling ───────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [userId, refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    preferences,
    loadingList,
    loadingPrefs,
    savingPrefs,
    error,
    fetchNotifications,
    fetchPreferences,
    markRead,
    markAllRead,
    remove,
    savePreferences,
    toggleOptOut,
    clearError: () => setError(null),
  };
}
