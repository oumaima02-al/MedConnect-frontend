import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '../context/NotificationContext';

/* ── helpers ──────────────────────────────────────────── */
const TYPE_CONFIG = {
  MESSAGE:      { icon: '💬', color: '#3b82f6', bg: '#dbeafe' },
  APPOINTMENT:  { icon: '📅', color: '#8b5cf6', bg: '#ede9fe' },
  PRESCRIPTION: { icon: '💊', color: '#2ecc71', bg: '#dcfce7' },
  ALERT:        { icon: '🚨', color: '#ef4444', bg: '#fef2f2' },
  SECURITY:     { icon: '🔐', color: '#f97316', bg: '#ffedd5' },
  TELECONSULT:  { icon: '🎥', color: '#ec4899', bg: '#fce7f3' },
  LAB:          { icon: '🧪', color: '#eab308', bg: '#fef9c3' },
};

const relativeTime = (iso) => {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

/* ── Single notification row in the dropdown ──────────── */
function NotifItem({ notif, onRead, onDelete }) {
  const cfg = TYPE_CONFIG[notif.type] || { icon: '🔔', color: '#6b7280', bg: '#f3f4f6' };

  return (
    <div
      onClick={() => !notif.read && onRead(notif.id)}
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 16px',
        cursor: notif.read ? 'default' : 'pointer',
        background: notif.read ? 'transparent' : '#f0fdf4',
        borderBottom: '1px solid #f9fafb',
        transition: 'background 0.15s',
        position: 'relative',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = notif.read ? '#f9fafb' : '#e7fef0'}
      onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'transparent' : '#f0fdf4'}
    >
      {/* Type icon */}
      <div style={{
        width: 38, height: 38, borderRadius: 12, flexShrink: 0,
        background: cfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem',
      }}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ fontWeight: notif.read ? 500 : 700, fontSize: '0.83rem', color: '#111827', lineHeight: 1.3 }}>
            {notif.title}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {relativeTime(notif.createdAt)}
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {notif.content}
        </div>
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0, marginTop: 5 }} />
      )}

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
        style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: 2, borderRadius: 4, fontSize: 12, opacity: 0, transition: 'opacity 0.15s' }}
        className="notif-delete-btn"
        title="Supprimer"
      >
        ✕
      </button>
    </div>
  );
}

/* ── Bell + Dropdown ────────────────────────────────────── */
export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loadingList,
    fetchNotifications,
    markRead,
    markAllRead,
    remove,
  } = useNotificationContext();

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const preview = notifications.slice(0, 6);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: open ? '#f0fdf4' : 'none',
          border: open ? '1px solid #bbf7d0' : '1px solid transparent',
          borderRadius: 10,
          cursor: 'pointer',
          padding: '6px 8px',
          position: 'relative',
          color: open ? '#2ecc71' : '#6b7280',
          transition: 'all 0.15s',
          display: 'flex', alignItems: 'center',
        }}
        title="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            minWidth: 18, height: 18,
            background: '#ef4444',
            borderRadius: 50, border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.62rem', fontWeight: 800, color: 'white',
            padding: '0 3px',
            animation: 'badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 380, maxHeight: 520,
          background: 'white',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.14)',
          border: '1px solid #f3f4f6',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          zIndex: 200,
          animation: 'dropIn 0.18s ease',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1rem', color: '#111827' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{ marginLeft: 8, background: '#f0fdf4', color: '#166534', fontSize: '0.72rem', fontWeight: 700, borderRadius: 50, padding: '2px 8px', border: '1px solid #bbf7d0' }}>
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: '#2ecc71', fontWeight: 600, padding: '4px 8px', borderRadius: 8, transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingList && (
              <div style={{ padding: 24 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: '#f3f4f6', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 11, background: '#f3f4f6', borderRadius: 6, width: '60%', marginBottom: 7 }} />
                      <div style={{ height: 9, background: '#f3f4f6', borderRadius: 6, width: '90%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingList && preview.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>🔔</div>
                <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>Aucune notification</div>
                <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Vous êtes à jour !</div>
              </div>
            )}

            {!loadingList && preview.map((n) => (
              <NotifItem key={n.id} notif={n} onRead={markRead} onDelete={remove} />
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
            <button
              onClick={() => { setOpen(false); navigate('/app/notifications'); }}
              style={{ width: '100%', padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#374151', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#bbf7d0'; e.currentTarget.style.color = '#166534'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
            >
              Voir toutes les notifications →
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes badgePop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .notif-delete-btn { opacity: 0; }
        div:hover > .notif-delete-btn { opacity: 1; }
      `}</style>
    </div>
  );
}
