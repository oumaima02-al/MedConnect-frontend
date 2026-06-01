import { useState, useEffect } from 'react';
import { useNotificationContext } from '../context/NotificationContext';

/* ── constants ────────────────────────────────────────────── */
const TYPE_CONFIG = {
  MESSAGE:      { icon: '💬', label: 'Message',        color: '#3b82f6', bg: '#dbeafe' },
  APPOINTMENT:  { icon: '📅', label: 'Rendez-vous',    color: '#8b5cf6', bg: '#ede9fe' },
  PRESCRIPTION: { icon: '💊', label: 'Ordonnance',     color: '#2ecc71', bg: '#dcfce7' },
  ALERT:        { icon: '🚨', label: 'Alerte',         color: '#ef4444', bg: '#fef2f2' },
  SECURITY:     { icon: '🔐', label: 'Sécurité',       color: '#f97316', bg: '#ffedd5' },
  TELECONSULT:  { icon: '🎥', label: 'Téléconsult.',   color: '#ec4899', bg: '#fce7f3' },
  LAB:          { icon: '🧪', label: 'Résultats labo', color: '#eab308', bg: '#fef9c3' },
};

const NOTIF_TYPES = Object.keys(TYPE_CONFIG);
const CHANNELS = ['IN_APP', 'EMAIL', 'SMS', 'PUSH'];
const FREQUENCIES = ['IMMEDIATE', 'DAILY', 'WEEKLY'];

const fmtDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

/* ── Notification row ──────────────────────────────────────── */
function NotifRow({ notif, onRead, onDelete }) {
  const cfg = TYPE_CONFIG[notif.type] || { icon: '🔔', color: '#6b7280', bg: '#f3f4f6', label: notif.type };

  return (
    <div style={{
      display: 'flex', gap: 14, padding: '16px 20px',
      background: notif.read ? 'white' : 'linear-gradient(90deg, #f0fdf4 0%, white 100%)',
      borderBottom: '1px solid #f9fafb',
      transition: 'background 0.2s',
      alignItems: 'flex-start',
    }}>
      {/* Icon */}
      <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
        {cfg.icon}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: notif.read ? 500 : 700, fontSize: '0.9rem', color: '#111827' }}>
            {notif.title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{fmtDate(notif.createdAt)}</span>
            {/* Type badge */}
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: cfg.color, background: cfg.bg, borderRadius: 50, padding: '2px 8px' }}>
              {cfg.label}
            </span>
          </div>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 }}>
          {notif.content}
        </p>
        {notif.channel && (
          <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4, display: 'inline-block' }}>
            via {notif.channel} · {notif.status}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
        {!notif.read && (
          <button
            onClick={() => onRead(notif.id)}
            title="Marquer comme lu"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem', color: '#166534', fontWeight: 600, transition: 'all 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#dcfce7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f0fdf4'; }}
          >
            ✓ Lu
          </button>
        )}
        {notif.read && (
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db' }} title="Lu" />
        )}
        {!notif.read && (
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 0 2px ${cfg.bg}` }} title="Non lu" />
        )}
        <button
          onClick={() => onDelete(notif.id)}
          title="Supprimer"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
        >
          🗑
        </button>
      </div>
    </div>
  );
}

/* ── Preferences panel ─────────────────────────────────────── */
function PreferencesPanel({ preferences, loadingPrefs, savingPrefs, onSave, onToggleOptOut }) {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (preferences && !form) setForm({ ...preferences });
  }, [preferences]);

  if (loadingPrefs || !form) {
    return (
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 44, background: '#f3f4f6', borderRadius: 12 }} />)}
      </div>
    );
  }

  const handleSave = async () => {
    const ok = await onSave(form);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  const ToggleRow = ({ label, field }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f9fafb' }}>
      <span style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500 }}>{label}</span>
      <button
        onClick={() => setForm(f => ({ ...f, [field]: !f[field] }))}
        style={{
          width: 44, height: 24, borderRadius: 50, border: 'none', cursor: 'pointer',
          background: form[field] ? '#2ecc71' : '#d1d5db',
          position: 'relative', transition: 'background 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: form[field] ? 22 : 3,
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );

  return (
    <div style={{ padding: '24px 28px', maxWidth: 700 }}>
      <h3 style={{ margin: '0 0 24px', fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#111827' }}>
        ⚙️ Préférences de notification
      </h3>

      {/* Channels */}
      <div style={{ background: 'white', borderRadius: 20, padding: '8px 20px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 0 4px' }}>Canaux de notification</div>
        <ToggleRow label="🔔 In-App (dans l'application)" field="inAppEnabled" />
        <ToggleRow label="📧 Email" field="emailEnabled" />
        <ToggleRow label="📱 SMS" field="smsEnabled" />
        <ToggleRow label="🔃 Push mobile" field="pushEnabled" />
      </div>

      {/* Frequency */}
      <div style={{ background: 'white', borderRadius: 20, padding: '20px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Fréquence de réception</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {FREQUENCIES.map(freq => (
            <button
              key={freq}
              onClick={() => setForm(f => ({ ...f, frequency: freq }))}
              style={{
                flex: 1, padding: '10px', borderRadius: 12,
                border: `2px solid ${form.frequency === freq ? '#2ecc71' : '#e5e7eb'}`,
                background: form.frequency === freq ? '#f0fdf4' : 'white',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                color: form.frequency === freq ? '#166534' : '#6b7280',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
            >
              {freq === 'IMMEDIATE' ? '⚡ Immédiat' : freq === 'DAILY' ? '📆 Quotidien' : '📅 Hebdo'}
            </button>
          ))}
        </div>
      </div>

      {/* Do Not Disturb */}
      <div style={{ background: 'white', borderRadius: 20, padding: '20px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>🌙 Ne pas déranger</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', color: '#374151', flex: 1 }}>
            Début
            <input type="time" value={form.doNotDisturbStart || '22:00'} onChange={e => setForm(f => ({ ...f, doNotDisturbStart: e.target.value }))}
              style={{ display: 'block', marginTop: 6, padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' }}
            />
          </label>
          <div style={{ marginTop: 20, color: '#9ca3af', flexShrink: 0 }}>→</div>
          <label style={{ fontSize: '0.85rem', color: '#374151', flex: 1 }}>
            Fin
            <input type="time" value={form.doNotDisturbEnd || '08:00'} onChange={e => setForm(f => ({ ...f, doNotDisturbEnd: e.target.value }))}
              style={{ display: 'block', marginTop: 6, padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' }}
            />
          </label>
        </div>
      </div>

      {/* Opt-out per type */}
      {preferences?.optedOutTypes !== undefined && (
        <div style={{ background: 'white', borderRadius: 20, padding: '20px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Types de notifications</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {NOTIF_TYPES.map(type => {
              const cfg = TYPE_CONFIG[type];
              const isOptedOut = preferences.optedOutTypes?.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => onToggleOptOut(type)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                    border: `1.5px solid ${isOptedOut ? '#fecaca' : '#bbf7d0'}`,
                    background: isOptedOut ? '#fef2f2' : '#f0fdf4',
                    fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600,
                    color: isOptedOut ? '#ef4444' : '#166534',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                  <span style={{ marginLeft: 'auto', opacity: 0.6 }}>{isOptedOut ? 'Off' : 'On'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={savingPrefs}
        style={{
          padding: '13px 32px', background: savingPrefs ? '#9ca3af' : '#111827',
          color: 'white', border: 'none', borderRadius: 50, cursor: savingPrefs ? 'default' : 'pointer',
          fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit',
          boxShadow: savingPrefs ? 'none' : '0 8px 24px rgba(0,0,0,0.15)',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        {savingPrefs ? 'Sauvegarde…' : saved ? '✅ Sauvegardé !' : '💾 Sauvegarder les préférences'}
      </button>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'preferences'

  const {
    notifications,
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
    clearError,
    unreadCount,
  } = useNotificationContext();

  useEffect(() => {
    if (activeTab === 'all' || activeTab === 'unread') fetchNotifications();
    if (activeTab === 'preferences') fetchPreferences();
  }, [activeTab]);

  const displayed = activeTab === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const TABS = [
    { id: 'all', label: 'Toutes' },
    { id: 'unread', label: `Non lues ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
    { id: 'preferences', label: '⚙️ Préférences' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#111827', letterSpacing: '-0.5px' }}>
            🔔 Notifications
          </h1>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>
            Gérez vos alertes et préférences de notification
          </p>
        </div>
        {activeTab !== 'preferences' && unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{ padding: '10px 20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 50, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#166534', fontFamily: 'inherit', transition: 'all 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#dcfce7'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f0fdf4'}
          >
            ✓ Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ padding: '12px 20px', background: '#fef2f2', borderRadius: 14, border: '1px solid #fecaca', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>⚠️ {error}</span>
          <button onClick={clearError} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18 }}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#f9fafb', borderRadius: 14, padding: 6 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activeTab === tab.id ? 'white' : 'transparent',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#111827' : '#6b7280',
              fontSize: '0.88rem', fontFamily: 'inherit',
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        {activeTab === 'preferences' ? (
          <PreferencesPanel
            preferences={preferences}
            loadingPrefs={loadingPrefs}
            savingPrefs={savingPrefs}
            onSave={savePreferences}
            onToggleOptOut={toggleOptOut}
          />
        ) : (
          <>
            {loadingList && (
              <div style={{ padding: 32 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid #f9fafb' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f3f4f6', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 6, width: '40%', marginBottom: 10 }} />
                      <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, width: '80%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingList && displayed.length === 0 && (
              <div style={{ padding: 64, textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>
                  {activeTab === 'unread' ? '✅' : '🔔'}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#374151', marginBottom: 6 }}>
                  {activeTab === 'unread' ? 'Tout est lu !' : 'Aucune notification'}
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  {activeTab === 'unread' ? 'Vous n\'avez aucune notification non lue.' : 'Les notifications apparaîtront ici.'}
                </div>
              </div>
            )}

            {!loadingList && displayed.map(n => (
              <NotifRow key={n.id} notif={n} onRead={markRead} onDelete={remove} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
