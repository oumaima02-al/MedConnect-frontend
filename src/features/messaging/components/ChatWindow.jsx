import { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';

const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today - 86400000);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};

/** Insert date separators between messages when the date changes */
const withDateSeparators = (messages) => {
  const result = [];
  let lastDate = '';
  messages.forEach((m) => {
    const dateLabel = fmtDate(m.sentAt);
    if (dateLabel && dateLabel !== lastDate) {
      result.push({ _separator: true, label: dateLabel, key: `sep-${m.id}` });
      lastDate = dateLabel;
    }
    result.push(m);
  });
  return result;
};

export default function ChatWindow({
  conversation,
  messages,
  loading,
  sending,
  error,
  hasMore,
  searchQuery,
  isSearching,
  currentUserId,
  onSend,
  onEdit,
  onDelete,
  onReact,
  onLoadMore,
  onSearch,
  onClearSearch,
  onMarkRead,
}) {
  const [input, setInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);
  const prevLenRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive (but not when loading older)
  useEffect(() => {
    const newLen = messages.length;
    if (newLen > prevLenRef.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    prevLenRef.current = newLen;
  }, [messages]);

  // Mark last visible messages as read
  useEffect(() => {
    if (!messages.length || !currentUserId) return;
    const unread = messages.filter((m) => m.senderId !== currentUserId && !m._pending);
    unread.slice(-5).forEach((m) => onMarkRead?.(m.id));
  }, [messages, currentUserId, onMarkRead]);

  const handleSend = useCallback(async () => {
    const val = input.trim();
    if (!val) return;
    setInput('');
    inputRef.current?.focus();
    await onSend(val);
  }, [input, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchInput);
  };

  if (!conversation) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>💬</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>MedConnect Messagerie</div>
          <div style={{ fontSize: '0.9rem' }}>Sélectionnez une conversation pour commencer</div>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.participants?.find((p) => p !== currentUserId) || 'Contact';
  const label = conversation.name || otherParticipant;
  const items = withDateSeparators(messages);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#fafafa' }}>

      {/* ── Header ── */}
      <div style={{
        height: 68, display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 20px', background: 'white', borderBottom: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        {/* Avatar */}
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #a7f3d0, #2ecc71)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'white', flexShrink: 0 }}>
          {label.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{label}</div>
          {conversation.type === 'ONE_TO_ONE' && (
            <div style={{ fontSize: '0.75rem', color: '#2ecc71', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2ecc71' }} /> En ligne
            </div>
          )}
        </div>

        {/* Search toggle */}
        <button
          onClick={() => { setShowSearch((v) => !v); if (showSearch) { setSearchInput(''); onClearSearch?.(); } }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 10, color: showSearch ? '#2ecc71' : '#9ca3af', transition: 'all 0.15s' }}
          title="Rechercher dans la conversation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </div>

      {/* ── Search bar ── */}
      {showSearch && (
        <form onSubmit={handleSearch} style={{ padding: '10px 16px', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
          <input
            autoFocus
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher dans la conversation…"
            style={{ flex: 1, padding: '8px 14px', borderRadius: 50, border: '1px solid #e5e7eb', outline: 'none', fontSize: '0.85rem', fontFamily: 'inherit' }}
          />
          <button type="submit" style={{ background: '#2ecc71', color: 'white', border: 'none', borderRadius: 50, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Chercher</button>
          {isSearching && (
            <button type="button" onClick={() => { onClearSearch?.(); setSearchInput(''); }} style={{ background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 50, padding: '8px 14px', cursor: 'pointer', fontSize: '0.85rem' }}>✕ Effacer</button>
          )}
        </form>
      )}

      {/* Search result count */}
      {isSearching && (
        <div style={{ padding: '8px 20px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', fontSize: '0.8rem', color: '#166534' }}>
          🔍 {messages.length} résultat(s) pour « {searchQuery} »
        </div>
      )}

      {/* ── Messages area ── */}
      <div
        ref={messagesRef}
        style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {/* Load more button */}
        {hasMore && !isSearching && (
          <div style={{ textAlign: 'center', padding: 12 }}>
            <button
              onClick={onLoadMore}
              disabled={loading}
              style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 50, padding: '8px 20px', cursor: loading ? 'default' : 'pointer', fontSize: '0.82rem', color: '#6b7280', transition: 'all 0.15s' }}
            >
              {loading ? 'Chargement…' : '↑ Voir les messages précédents'}
            </button>
          </div>
        )}

        {/* Skeleton loading */}
        {loading && messages.length === 0 && (
          <div style={{ padding: '0 16px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                <div style={{ width: `${100 + (i * 40)}px`, height: 40, background: '#f3f4f6', borderRadius: 20 }} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ margin: '8px 16px', padding: '10px 16px', background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca', fontSize: '0.85rem', color: '#ef4444' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9ca3af', padding: 40 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👋</div>
            <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>
              {isSearching ? 'Aucun résultat' : 'Démarrez la conversation !'}
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              {isSearching ? 'Essayez avec d\'autres mots clés' : `Envoyez votre premier message à ${label}`}
            </div>
          </div>
        )}

        {/* Messages */}
        {items.map((item) => {
          if (item._separator) {
            return (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 24px 8px', color: '#9ca3af', fontSize: '0.75rem' }}>
                <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
                <span style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 50, padding: '3px 12px', fontWeight: 500 }}>{item.label}</span>
                <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
              </div>
            );
          }
          return (
            <MessageBubble
              key={item.id}
              message={item}
              isOwn={item.senderId === currentUserId}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onReact={onReact}
            />
          );
        })}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />

        {/* Sending spinner */}
        {sending && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 20px' }}>
            <div style={{ background: '#dcfce7', borderRadius: 20, padding: '8px 16px', fontSize: '0.85rem', color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ecc71', animation: 'pulse 1s infinite' }} />
              Envoi…
            </div>
          </div>
        )}
      </div>

      {/* ── Input area ── */}
      <div style={{
        padding: '12px 16px',
        background: 'white',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
      }}>
        <div style={{ flex: 1, background: '#f9fafb', borderRadius: 24, border: '1.5px solid #e5e7eb', padding: '10px 16px', display: 'flex', alignItems: 'center', transition: 'border-color 0.15s' }}
          onFocusCapture={(e) => e.currentTarget.style.borderColor = '#2ecc71'}
          onBlurCapture={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez un message…"
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: '0.9rem', fontFamily: 'inherit', resize: 'none',
              lineHeight: 1.5, maxHeight: 120, color: '#111827',
            }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: input.trim() && !sending ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : '#f3f4f6',
            border: 'none', cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: input.trim() ? '0 4px 14px rgba(46,204,113,0.35)' : 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { if (input.trim()) e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !sending ? 'white' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </div>
  );
}
