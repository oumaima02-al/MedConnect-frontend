import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getUserConversations,
  createConversation,
  archiveConversation,
  pinConversation,
  muteConversation,
} from '../services/messagingService';

/**
 * Manages the list of conversations for the current user.
 * Handles loading, creating, archiving, pinning, and muting.
 */
export function useConversations(userId) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserConversations(userId);
      // Pinned conversations first, then sorted by last message date
      const sorted = [...data].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt);
      });
      setConversations(sorted);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des conversations.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const startConversation = useCallback(async (participantId) => {
    if (!userId || !participantId) return null;
    try {
      const conv = await createConversation([userId, participantId], 'ONE_TO_ONE');
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conv.id);
        if (exists) return prev;
        return [conv, ...prev];
      });
      return conv;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [userId]);

  const archive = useCallback(async (conversationId) => {
    try {
      await archiveConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const pin = useCallback(async (conversationId) => {
    try {
      const updated = await pinConversation(conversationId);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, pinned: updated.pinned } : c))
      );
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const mute = useCallback(async (conversationId) => {
    try {
      const updated = await muteConversation(conversationId);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, muted: updated.muted } : c))
      );
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return {
    conversations,
    loading,
    error,
    refresh: fetchConversations,
    startConversation,
    archive,
    pin,
    mute,
  };
}
