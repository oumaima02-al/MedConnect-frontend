import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markMessageRead,
  addReaction,
  removeReaction,
  searchMessages,
  sendTypingIndicator,
} from '../services/messagingService';

/**
 * Manages messages within a single conversation.
 * Covers: load, send, edit, delete, reactions, read receipts, typing indicator, search.
 */
export function useMessages(conversationId, currentUserId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchResults, setSearchResults] = useState(null); // null = no search active
  const [searchQuery, setSearchQuery] = useState('');
  const typingTimerRef = useRef(null);
  const PAGE_SIZE = 30;

  // Load (or reload) messages — newest first from the API, displayed oldest-first
  const fetchMessages = useCallback(async (pageNum = 0, append = false) => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMessages(conversationId, pageNum, PAGE_SIZE);
      const ordered = [...data].reverse(); // API returns newest-first; flip for display
      setMessages((prev) => (append ? [...ordered, ...prev] : ordered));
      setHasMore(data.length === PAGE_SIZE);
      if (!append) setPage(0);
    } catch (err) {
      setError(err.message || 'Impossible de charger les messages.');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      setPage(0);
      setHasMore(true);
      setSearchResults(null);
      setSearchQuery('');
      fetchMessages(0, false);
    }
  }, [conversationId, fetchMessages]);

  /** Load older messages (pagination) */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchMessages(nextPage, true);
  }, [hasMore, loading, page, fetchMessages]);

  /** Send a new message */
  const send = useCallback(async (content, messageType = 'TEXT') => {
    if (!content.trim() || !conversationId || !currentUserId) return null;
    setSending(true);
    setError(null);

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      conversationId,
      senderId: currentUserId,
      content,
      messageType,
      sentAt: new Date().toISOString(),
      edited: false,
      deleted: false,
      _pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const real = await sendMessage(conversationId, currentUserId, content, messageType);
      // Replace optimistic message with real one
      setMessages((prev) => prev.map((m) => (m.id === tempId ? real : m)));
      return real;
    } catch (err) {
      // Roll back optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(err.message || 'Échec de l\'envoi du message.');
      return null;
    } finally {
      setSending(false);
    }
  }, [conversationId, currentUserId]);

  /** Edit a message */
  const edit = useCallback(async (messageId, newContent) => {
    try {
      const updated = await editMessage(messageId, newContent);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, ...updated } : m)));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  /** Delete a message */
  const remove = useCallback(async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, deleted: true, content: '' } : m))
      );
    } catch (err) {
      setError(err.message);
    }
  }, []);

  /** Mark a message as read */
  const markRead = useCallback(async (messageId) => {
    if (!currentUserId) return;
    try {
      await markMessageRead(messageId, currentUserId);
    } catch {
      // Non-blocking — silently fail
    }
  }, [currentUserId]);

  /** Toggle emoji reaction on a message */
  const toggleReaction = useCallback(async (messageId, emoji) => {
    if (!currentUserId) return;
    // Optimistically update local reactions
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = m.reactions || [];
        const existing = reactions.find((r) => r.userId === currentUserId && r.emoji === emoji);
        return {
          ...m,
          reactions: existing
            ? reactions.filter((r) => !(r.userId === currentUserId && r.emoji === emoji))
            : [...reactions, { userId: currentUserId, emoji, reactedAt: new Date().toISOString() }],
        };
      })
    );
    try {
      const reactions = messages.find((m) => m.id === messageId)?.reactions || [];
      const alreadyReacted = reactions.find((r) => r.userId === currentUserId && r.emoji === emoji);
      if (alreadyReacted) {
        await removeReaction(messageId, currentUserId, emoji);
      } else {
        await addReaction(messageId, currentUserId, emoji);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [currentUserId, messages]);

  /** Search messages in this conversation */
  const search = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const results = await searchMessages(conversationId, query);
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
    }
  }, [conversationId]);

  /** Notify backend of typing (debounced internally) */
  const notifyTyping = useCallback(() => {
    if (!conversationId || !currentUserId) return;
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTypingIndicator(conversationId, currentUserId).catch(() => {});
    }, 500);
  }, [conversationId, currentUserId]);

  return {
    messages: searchResults ?? messages,
    loading,
    sending,
    error,
    hasMore,
    searchQuery,
    isSearching: searchResults !== null,
    fetchMessages,
    loadMore,
    send,
    edit,
    remove,
    markRead,
    toggleReaction,
    search,
    clearSearch: () => { setSearchResults(null); setSearchQuery(''); },
    notifyTyping,
  };
}
