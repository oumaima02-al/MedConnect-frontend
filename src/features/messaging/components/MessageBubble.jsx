import { useState } from 'react';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '👏'];

const fmtTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

/** Groups message reactions into a { emoji: count } map */
const groupReactions = (reactions = []) =>
  reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

/* ───────────────────────────────────────────────────────────── */
export default function MessageBubble({
  message,
  isOwn,
  currentUserId,
  onEdit,
  onDelete,
  onReact,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);

  if (message.deleted) {
    return (
      <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', margin: '4px 16px' }}>
        <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic', padding: '6px 12px', background: '#f3f4f6', borderRadius: 12 }}>
          🗑 Message supprimé
        </div>
      </div>
    );
  }

  const reactions = groupReactions(message.reactions);
  const hasReactions = Object.keys(reactions).length > 0;

  const handleEdit = () => {
    if (editValue.trim() && editValue !== message.content) {
      onEdit?.(message.id, editValue.trim());
    }
    setEditing(false);
  };

  const canEdit = () => {
    if (!isOwn) return false;
    const diffMs = Date.now() - new Date(message.sentAt).getTime();
    return diffMs < 15 * 60 * 1000; // 15 minutes
  };

  const canDelete = () => {
    if (!isOwn) return false;
    const diffMs = Date.now() - new Date(message.sentAt).getTime();
    return diffMs < 60 * 60 * 1000; // 1 hour
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        margin: '2px 16px',
        position: 'relative',
      }}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => { setShowMenu(false); setShowEmojiPicker(false); }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: isOwn ? 'row-reverse' : 'row' }}>
        {/* Bubble */}
        <div style={{ maxWidth: 440, position: 'relative' }}>
          {editing ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') setEditing(false); }}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '2px solid #2ecc71', outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit' }}
              />
              <button onClick={handleEdit} style={{ background: '#2ecc71', color: 'white', border: 'none', borderRadius: 12, padding: '8px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>✓</button>
              <button onClick={() => setEditing(false)} style={{ background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 12, padding: '8px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>✕</button>
            </div>
          ) : (
            <div style={{
              padding: '10px 16px',
              borderRadius: isOwn ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              background: isOwn ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : '#f3f4f6',
              color: isOwn ? 'white' : '#111827',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              boxShadow: isOwn ? '0 4px 12px rgba(46,204,113,0.25)' : '0 2px 8px rgba(0,0,0,0.05)',
              wordBreak: 'break-word',
            }}>
              {message.content}
              {message.edited && (
                <span style={{ fontSize: '0.68rem', opacity: 0.6, marginLeft: 6 }}>(modifié)</span>
              )}
            </div>
          )}

          {/* Reactions */}
          {hasReactions && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4,
              justifyContent: isOwn ? 'flex-end' : 'flex-start',
            }}>
              {Object.entries(reactions).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => onReact?.(message.id, emoji)}
                  title={`${count} réaction(s) — cliquer pour ${message.reactions?.some(r => r.userId === currentUserId && r.emoji === emoji) ? 'retirer' : 'ajouter'}`}
                  style={{
                    background: message.reactions?.some(r => r.userId === currentUserId && r.emoji === emoji)
                      ? isOwn ? 'rgba(255,255,255,0.25)' : '#dcfce7'
                      : isOwn ? 'rgba(255,255,255,0.12)' : 'white',
                    border: isOwn ? '1px solid rgba(255,255,255,0.3)' : '1px solid #e5e7eb',
                    borderRadius: 50, padding: '2px 8px', cursor: 'pointer',
                    fontSize: '0.8rem', fontFamily: 'inherit',
                  }}
                >
                  {emoji} {count > 1 && <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hover actions */}
        {showMenu && !editing && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {/* Emoji reaction button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowEmojiPicker((v) => !v)}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: '5px 8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                title="Réagir"
              >
                😀
              </button>
              {showEmojiPicker && (
                <div style={{
                  position: 'absolute', bottom: 36,
                  [isOwn ? 'right' : 'left']: 0,
                  background: 'white', border: '1px solid #e5e7eb', borderRadius: 16,
                  padding: '8px 10px', display: 'flex', gap: 6,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50,
                }}>
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => { onReact?.(message.id, emoji); setShowEmojiPicker(false); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: 4, borderRadius: 8, transition: 'transform 0.1s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Edit / Delete — own messages only */}
            {isOwn && canEdit() && (
              <button
                onClick={() => setEditing(true)}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: '5px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                title="Modifier"
              >
                ✏️
              </button>
            )}
            {isOwn && canDelete() && (
              <button
                onClick={() => onDelete?.(message.id)}
                style={{ background: '#fef2f2', border: 'none', borderRadius: 10, padding: '5px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                title="Supprimer"
              >
                🗑
              </button>
            )}
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: 3, paddingLeft: isOwn ? 0 : 2, paddingRight: isOwn ? 2 : 0 }}>
        {fmtTime(message.sentAt)}
        {message._pending && <span style={{ marginLeft: 4, opacity: 0.5 }}>⏳</span>}
      </div>
    </div>
  );
}
