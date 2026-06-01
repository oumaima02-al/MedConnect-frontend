import { useState } from 'react';

/* ─── small colour helpers ─────────────────────────────────── */
const avatarBg = (str = '') => {
  const hues = [150, 190, 220, 270, 30, 340];
  const idx = (str.charCodeAt(0) || 0) % hues.length;
  return `hsl(${hues[idx]}, 65%, 55%)`;
};

const initials = (str = '') =>
  str
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';

const relativeTime = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

/* ─── ConversationItem ─────────────────────────────────────── */
export function ConversationItem({ conv, isActive, currentUserId, onClick, onArchive, onPin, onMute }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const otherParticipant = conv.participants?.find((p) => p !== currentUserId) || 'Inconnu';
  const label = conv.name || otherParticipant;

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 16,
        cursor: 'pointer',
        background: isActive ? '#f0fdf4' : 'transparent',
        border: isActive ? '1px solid #bbf7d0' : '1px solid transparent',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#f9fafb'; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: avatarBg(label),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 14, color: 'white',
        position: 'relative',
      }}>
        {initials(label)}
        {conv.pinned && (
          <div style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: '50%', background: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>📌</div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: 8 }}>
            {relativeTime(conv.lastMessageAt)}
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: conv.muted ? '#9ca3af' : '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
          {conv.muted && <span title="Muet" style={{ fontSize: 10 }}>🔕</span>}
          {conv.lastMessage || <em style={{ opacity: 0.5 }}>Nouvelle conversation</em>}
        </div>
      </div>

      {/* Context menu button */}
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, color: '#9ca3af', flexShrink: 0, opacity: 0 }}
        className="conv-menu-btn"
      >
        ⋯
      </button>

      {menuOpen && (
        <div
          style={{ position: 'absolute', right: 8, top: 48, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, minWidth: 160, overflow: 'hidden' }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { label: conv.pinned ? '📌 Désépingler' : '📌 Épingler', action: () => { onPin?.(); setMenuOpen(false); } },
            { label: conv.muted ? '🔔 Activer les notif.' : '🔕 Mettre en sourdine', action: () => { onMute?.(); setMenuOpen(false); } },
            { label: '📦 Archiver', action: () => { onArchive?.(); setMenuOpen(false); } },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', color: '#374151', transition: 'background 0.1s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`.conv-menu-btn { opacity: 0; } div:hover .conv-menu-btn { opacity: 1; }`}</style>
    </div>
  );
}

/* ─── ConversationList ─────────────────────────────────────── */
export default function ConversationList({
  conversations,
  loading,
  error,
  activeConvId,
  currentUserId,
  onSelectConv,
  onArchive,
  onPin,
  onMute,
  onNewConversation,
}) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const label = c.name || c.participants?.find((p) => p !== currentUserId) || '';
    return label.toLowerCase().includes(search.toLowerCase()) ||
      (c.lastMessage || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.15rem', color: '#111827' }}>
            Messages
          </h2>
          <button
            onClick={onNewConversation}
            title="Nouvelle conversation"
            style={{ width: 34, height: 34, borderRadius: '50%', background: '#2ecc71', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(46,204,113,0.35)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: 50, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
        {loading && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f3f4f6' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, background: '#f3f4f6', borderRadius: 6, marginBottom: 8, width: '60%' }} />
                  <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ margin: 12, padding: '12px 16px', background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca', fontSize: '0.85rem', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Aucune conversation</div>
            <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Commencez une nouvelle discussion</div>
          </div>
        )}

        {!loading && filtered.map((conv) => (
          <ConversationItem
            key={conv.id}
            conv={conv}
            isActive={conv.id === activeConvId}
            currentUserId={currentUserId}
            onClick={() => onSelectConv(conv)}
            onArchive={() => onArchive?.(conv.id)}
            onPin={() => onPin?.(conv.id)}
            onMute={() => onMute?.(conv.id)}
          />
        ))}
      </div>
    </div>
  );
}
