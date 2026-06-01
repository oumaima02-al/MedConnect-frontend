import { useState } from 'react';

// ─── Icons ────────────────────────────────────────────────────
export function RxIcon({ name, size = 18, color = 'currentColor' }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'pill':         return <svg {...p}><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>;
    case 'plus':         return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'x':            return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'edit':         return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case 'trash':        return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
    case 'eye':          return <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'refresh':      return <svg {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
    case 'bell':         return <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case 'pharmacy':     return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'map-pin':      return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
    case 'search':       return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'calendar':     return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case 'check':        return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'check-circle': return <svg {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    case 'clock':        return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case 'alert':        return <svg {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    case 'file':         return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case 'filter':       return <svg {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
    case 'user':         return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case 'phone':        return <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
    case 'package':      return <svg {...p}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    default: return null;
  }
}

// ─── Status badge colors ──────────────────────────────────────
const BADGE = {
  ACTIVE:             { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  EXPIRED:            { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
  CANCELLED:          { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  PENDING:            { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  APPROVED:           { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  REJECTED:           { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  ASSIGNED:           { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  IN_PROGRESS:        { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
  READY:              { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  COMPLETED:          { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
};

const BADGE_LABEL = {
  ACTIVE: 'Active', EXPIRED: 'Expirée', CANCELLED: 'Annulée',
  PENDING: 'En attente', APPROVED: 'Approuvé', REJECTED: 'Rejeté',
  ASSIGNED: 'Assigné', IN_PROGRESS: 'En cours', READY: 'Prêt', COMPLETED: 'Terminé',
};

export function Badge({ variant, label }) {
  const c = BADGE[variant] || { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      letterSpacing: '0.03em', whiteSpace: 'nowrap',
    }}>
      {label || BADGE_LABEL[variant] || variant}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────
export function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white', borderRadius: 18,
        border: '1px solid #f3f4f6',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'box-shadow 0.15s, transform 0.15s' : 'none',
        ...style,
      }}
      onMouseEnter={onClick ? e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; } : undefined}
      onMouseLeave={onClick ? e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; } : undefined}
    >
      {children}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────
export function SectionHeader({ icon, title, count, onAdd, addLabel = 'Ajouter', color = '#2ecc71', extra }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RxIcon name={icon} size={18} color={color} />
        </div>
        <div>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#111827', margin: 0 }}>{title}</h3>
          {count !== undefined && <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{count} élément{count !== 1 ? 's' : ''}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {extra}
        {onAdd && (
          <button id={`btn-add-${title.toLowerCase().replace(/\s+/g, '-')}`} onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: color, color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <RxIcon name="plus" size={14} color="white" />{addLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────
export function EmptyState({ icon, message, sub = '' }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <RxIcon name={icon} size={26} color="#9ca3af" />
      </div>
      <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, color: '#374151', marginBottom: 4 }}>{message}</p>
      {sub && <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>{sub}</p>}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────
export function Skeleton({ rows = 3 }) {
  return (
    <div style={{ padding: '20px 24px' }}>
      <style>{`@keyframes rx-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} style={{ height: 56, borderRadius: 12, marginBottom: 10, background: 'linear-gradient(90deg,#f3f4f6 25%,#e9ecef 50%,#f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'rx-shimmer 1.4s infinite', opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}

// ─── Error banner ─────────────────────────────────────────────
export function ErrorBanner({ message }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', margin: '12px 24px' }}>
      <RxIcon name="alert" size={18} color="#dc2626" />
      <p style={{ fontSize: '0.87rem', color: '#dc2626', fontWeight: 500 }}>{message}</p>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: width, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto', animation: 'rx-modal-in 0.2s ease' }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes rx-modal-in { from{opacity:0;transform:scale(0.95) translateY(-10px)} to{opacity:1;transform:none} }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#111827', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RxIcon name="x" size={16} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Form primitives ──────────────────────────────────────────
export function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: 10,
  fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', color: '#111827',
  background: '#fafafa', boxSizing: 'border-box', transition: 'border-color 0.2s',
};

export function Input({ value, onChange, placeholder, type = 'text', required, id, min }) {
  return (
    <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} min={min}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = '#7c3aed'}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
    />
  );
}

export function Textarea({ value, onChange, placeholder, rows = 3, id }) {
  return (
    <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{ ...inputStyle, resize: 'vertical' }}
      onFocus={e => e.target.style.borderColor = '#7c3aed'}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
    />
  );
}

export function Select({ value, onChange, options, placeholder, id }) {
  return (
    <select id={id} value={value} onChange={onChange} style={{ ...inputStyle, cursor: 'pointer' }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function SubmitBtn({ label = 'Enregistrer', loading = false, color = '#7c3aed' }) {
  return (
    <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 12, background: loading ? '#9ca3af' : color, color: 'white', border: 'none', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
      {loading ? 'En cours…' : label}
    </button>
  );
}

export function ActionBtn({ icon, color = '#6b7280', onClick, title, id }) {
  return (
    <button id={id} title={title} onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}18`}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <RxIcon name={icon} size={16} color={color} />
    </button>
  );
}

// ─── Data row ─────────────────────────────────────────────────
export function DataRow({ children }) {
  const [h, setH] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid #f9fafb', background: h ? '#fafafa' : 'transparent', transition: 'background 0.15s' }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      {children}
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────
export function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, minWidth: 130 }}>{label}</span>
      <span style={{ fontSize: '0.87rem', color: '#374151', fontWeight: 500, flex: 1 }}>{value || '—'}</span>
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', background: '#f8fafc', borderRadius: 14, padding: 4, border: '1px solid #f3f4f6' }}>
      {tabs.map(tab => (
        <button key={tab.key} id={`tab-rx-${tab.key}`} onClick={() => onChange(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 600, transition: 'all 0.18s', background: active === tab.key ? 'white' : 'transparent', color: active === tab.key ? '#111827' : '#6b7280', boxShadow: active === tab.key ? '0 1px 6px rgba(0,0,0,0.08)' : 'none' }}>
          <RxIcon name={tab.icon} size={15} color={active === tab.key ? (tab.color || '#7c3aed') : '#9ca3af'} />
          {tab.label}
          {tab.badge > 0 && <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#ef4444', color: 'white', padding: '1px 6px', borderRadius: 20 }}>{tab.badge}</span>}
        </button>
      ))}
    </div>
  );
}

// ─── Utility ──────────────────────────────────────────────────
export function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function isExpired(iso) {
  if (!iso) return false;
  return new Date(iso) < new Date();
}
