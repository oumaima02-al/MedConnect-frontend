import { useState } from 'react';
import { createConversation } from '../services/messagingService';

export default function NewConversationModal({ currentUserId, onClose, onCreated }) {
  const [participantId, setParticipantId] = useState('');
  const [type, setType] = useState('ONE_TO_ONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!participantId.trim()) { setError('Veuillez saisir un ID de participant.'); return; }
    setLoading(true);
    setError('');
    try {
      const conv = await createConversation([currentUserId, participantId.trim()], type);
      onCreated?.(conv);
      onClose();
    } catch (err) {
      setError(err.message || 'Impossible de créer la conversation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'white', borderRadius: 24, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', animation: 'slideUp 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#111827' }}>
            💬 Nouvelle conversation
          </h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#6b7280' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              ID du participant *
            </label>
            <input
              autoFocus
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              placeholder="ex: user_abc123"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              onFocus={(e) => e.target.style.borderColor = '#2ecc71'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Type de conversation
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { val: 'ONE_TO_ONE', label: '👤 Individuelle' },
                { val: 'GROUP', label: '👥 Groupe' },
              ].map(({ val, label }) => (
                <label key={val} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${type === val ? '#2ecc71' : '#e5e7eb'}`, background: type === val ? '#f0fdf4' : 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.15s' }}>
                  <input type="radio" value={val} checked={type === val} onChange={() => setType(val)} style={{ accentColor: '#2ecc71' }} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca', fontSize: '0.85rem', color: '#ef4444', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: 50, background: loading ? '#9ca3af' : '#2ecc71', color: 'white', border: 'none', cursor: loading ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 6px 20px rgba(46,204,113,0.35)', transition: 'all 0.2s' }}
          >
            {loading ? 'Création…' : 'Créer la conversation'}
          </button>
        </form>
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
